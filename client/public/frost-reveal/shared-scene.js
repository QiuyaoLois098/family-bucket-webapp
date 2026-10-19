/* Composite fixed typography with the moving photograph BEFORE scattering. */
window.SharedSceneRenderer=class {
  constructor(gl,buffer,vertex){
    this.gl=gl;this.buffer=buffer;
    const make=fragment=>{
      const p=gl.createProgram();
      for(const [type,src] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
        const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
        if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);
      }
      gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
    };
    this.compose=make(`precision highp float;varying vec2 vUv;
      uniform sampler2D photo,original,title;uniform float aspect,imageAspect,zoom,progress,brightness,opacity;uniform vec2 focus;
      vec2 cover(vec2 uv){vec2 s=vec2(1.);if(aspect>imageAspect)s.y=imageAspect/aspect;else s.x=aspect/imageAspect;return (uv-.5)*s+.5;}
      void main(){float e=progress*progress*(3.-2.*progress);float z=mix(zoom,1.,e);
        vec2 halfSpan=(cover(vec2(1.))-cover(vec2(0.)))/(2.*zoom);
        vec2 center=mix(clamp(focus,halfSpan,vec2(1.)-halfSpan),vec2(.5),e);
        vec2 uv=center+(cover(vUv)-.5)/z;
        vec3 bg=mix(texture2D(photo,uv).rgb,texture2D(original,uv).rgb,brightness);
        vec4 txt=texture2D(title,cover(vUv));gl_FragColor=vec4(mix(bg,txt.rgb,txt.a*opacity),1.);
      }`);
    this.blur=make(`precision highp float;varying vec2 vUv;uniform sampler2D image;uniform vec2 stepSize;
      void main(){vec4 c=vec4(0.);float total=0.;
        for(int i=-10;i<=10;i++){float f=float(i);float weight=exp(-f*f/32.);c+=texture2D(image,vUv+stepSize*f)*weight;total+=weight;}
        gl_FragColor=c/total;
      }`);
    this.title=this.texture();this.targets=[];this.width=0;this.height=0;
  }
  texture(){const g=this.gl,t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);for(const [p,v] of [[g.TEXTURE_MIN_FILTER,g.LINEAR],[g.TEXTURE_MAG_FILTER,g.LINEAR],[g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE],[g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE]])g.texParameteri(g.TEXTURE_2D,p,v);return t;}
  setTitle(source){const g=this.gl;g.bindTexture(g.TEXTURE_2D,this.title);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,source);}
  render(textures,width,height,params){
    const g=this.gl,h=Math.min(1280,height),w=Math.max(1,Math.round(h*width/height));
    if(w!==this.width||h!==this.height){
      for(const x of this.targets){g.deleteTexture(x.texture);g.deleteFramebuffer(x.fbo);}this.targets=[];this.width=w;this.height=h;
      for(let i=0;i<5;i++){const texture=this.texture();g.texImage2D(g.TEXTURE_2D,0,g.RGBA,w,h,0,g.RGBA,g.UNSIGNED_BYTE,null);const fbo=g.createFramebuffer();g.bindFramebuffer(g.FRAMEBUFFER,fbo);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,texture,0);if(g.checkFramebufferStatus(g.FRAMEBUFFER)!==g.FRAMEBUFFER_COMPLETE)throw Error('Shared scene buffer unavailable');this.targets.push({texture,fbo});}
    }
    const use=(p,target)=>{g.useProgram(p);g.bindBuffer(g.ARRAY_BUFFER,this.buffer);const pos=g.getAttribLocation(p,'aPosition');g.enableVertexAttribArray(pos);g.vertexAttribPointer(pos,2,g.FLOAT,false,0,0);g.bindFramebuffer(g.FRAMEBUFFER,target.fbo);g.viewport(0,0,w,h);};
    const bind=(p,name,unit,t)=>{g.activeTexture(g.TEXTURE0+unit);g.bindTexture(g.TEXTURE_2D,t);g.uniform1i(g.getUniformLocation(p,name),unit);};
    use(this.compose,this.targets[0]);bind(this.compose,'photo',0,textures[0]);bind(this.compose,'original',1,textures[7]);bind(this.compose,'title',2,this.title);
    for(const name of ['aspect','imageAspect','zoom','progress','brightness','opacity'])g.uniform1f(g.getUniformLocation(this.compose,name),params[name]);
    g.uniform2fv(g.getUniformLocation(this.compose,'focus'),params.focus);g.drawArrays(g.TRIANGLES,0,6);
    [9,28,70].forEach((radius,i)=>{
      // Prefilter each stronger level with the preceding Gaussian. Sampling a
      // sharp glyph at wide, regular intervals produces a visible lattice.
      // Add only the missing variance so the final blur radii stay unchanged.
      const previousRadius=i===0?0:[9,28][i-1];
      const spacing=Math.sqrt(radius*radius-previousRadius*previousRadius)*h/2048/6;
      use(this.blur,this.targets[4]);bind(this.blur,'image',0,this.targets[i].texture);g.uniform2f(g.getUniformLocation(this.blur,'stepSize'),spacing/w,0);g.drawArrays(g.TRIANGLES,0,6);
      use(this.blur,this.targets[i+1]);bind(this.blur,'image',0,this.targets[4].texture);g.uniform2f(g.getUniformLocation(this.blur,'stepSize'),0,spacing/h);g.drawArrays(g.TRIANGLES,0,6);
    });
    g.bindFramebuffer(g.FRAMEBUFFER,null);g.viewport(0,0,width,height);
    textures.forEach((t,i)=>{g.activeTexture(g.TEXTURE0+i);g.bindTexture(g.TEXTURE_2D,i<4?this.targets[i].texture:t);});
  }
};
