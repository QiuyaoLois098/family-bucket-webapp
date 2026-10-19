/* A dependency-free WebGL image effect. All uploaded images stay in memory. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('scene'), photo = $('photo');
  const viewer = photo.closest('.viewer');
  const clearText=document.body.dataset.clearText==='true';
  const selective=document.body.dataset.selective==='true';
  const scattered=document.body.dataset.layout==='scattered';
  const grouped=document.body.dataset.layout==='grouped';
  const destinationY=grouped?.545:scattered?.51:1937/3840;
  const combined = document.body.dataset.combined === 'true';
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
  if (!gl) { $('loading').textContent = 'WebGL is unavailable. Please use Chrome or Edge.'; return; }
  const vertex = `attribute vec2 aPosition; varying vec2 vUv; void main(){ vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.); }`;
  const fragment = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uImage,uBlurA,uBlurB,uBlurC,uText,uTextBlur,uGrain,uOriginal;
  uniform float uPhotoBrightness,uGlobalDim,uClearText,uTextOpacity,uBrightnessReveal,uWhiteExit;
  uniform float uEntryAge;
  uniform float uTime,uTextTime,uProgress,uBlur,uSoft,uColor,uMode,uAspect,uImageAspect,uRadius,uLight,uZoom,uZoomStart,uFraming,uTextEnabled,uTextStrength,uTextPeriod,uTextRadius;
  uniform vec2 uFocus;
  uniform vec2 uTextPosition;
  uniform float uPhotoCore,uTextCore,uCombined,uSelective,uTitleY;
  uniform vec4 uClouds[12];
  uniform vec3 uPalette[3];
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
  float fbm(vec2 p){return .57*noise(p)+.28*noise(p*2.03+6.7)+.15*noise(p*4.01+12.9);}
  vec2 cover(vec2 uv){vec2 s=vec2(1.);if(uAspect>uImageAspect){s.y=uImageAspect/uAspect;}else{s.x=uAspect/uImageAspect;}return (uv-.5)*s+.5;}
  void main(){
    vec2 uv=vUv;vec2 q=vec2(uv.x*uAspect,uv.y);
    float t=uTime*.075;
    vec2 warp=vec2(fbm(q*2.3+vec2(t,-t*.7)),fbm(q*2.8+vec2(-t*.6,t)+8.));
    float n=fbm(q*3.+warp*1.1+vec2(t*.7,-t*.3));
    // Local screen-space fields only: no full-frame haze or zoom-dependent size.
    float density=0.,localDepth=0.,depthEnergy=0.;
    vec3 colorSum=vec3(0.);
    float colorWeight=0.;
    for(int i=0;i<12;i++){
      vec2 d=(uv-uClouds[i].xy)*vec2(uAspect,1.);
      float kind=mod(float(i),6.);
      float angle=float(i)*1.047;
      mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
      d=rotation*d;
      d*=vec2(1.,mix(.85,1.12,.5+.5*sin(float(i)*2.)));
      d+=(warp-.5)*.014;
      float radius=max(.0001,uRadius*uClouds[i].z);
      // Transparent study: broad, slowly changing contours in screen space.
      // Deform the field, never the photo or the fixed foreground typography.
      if(uClearText>.5){
        vec2 flow=vec2(
          noise(q*2.1+vec2(t*.36,float(i)*1.73)),
          noise(q*1.8+vec2(float(i)*2.17,-t*.29)+13.));
        d+=(flow-.5)*radius*.72;
      }
      float distanceSquared=dot(d,d)/(radius*radius);
      // Strong center and a long, low-opacity feather; softness never fills the screen.
      float feather=.88*exp(-distanceSquared*mix(3.,1.9,uSoft))+.12*exp(-distanceSquared*.85);
      float core=exp(-distanceSquared*4.5);
      if(uClearText>.5){
        // A broad shoulder and faint outer tail avoid a circular cutoff.
        feather=.72*exp(-distanceSquared*mix(2.8,1.45,uSoft))
          +.28*exp(-distanceSquared*mix(1.2,.65,uSoft));
      }
      float profile=clamp(feather+(uPhotoCore-1.)*core,0.,3.);
      float weight=profile*uClouds[i].w;
      density+=weight;
      depthEnergy+=weight*weight*weight*weight;
      localDepth=max(localDepth,profile*uClouds[i].w*mix(.8,1.,mod(float(i),3.)/2.));
      vec3 tint=uPalette[0];
      if(kind>.5&&kind<2.5)tint=uPalette[1];
      if(kind>3.5&&kind<4.5)tint=uPalette[2];
      if(kind>4.5)tint=mix(uPalette[0],uPalette[2],.65);
      float coloredWeight=weight*weight;
      colorSum+=tint*coloredWeight;
      colorWeight+=coloredWeight;
    }
    float mask=(1.-exp(-density*3.))*(1.-uFraming);
    float zoomPhase=clamp((uProgress-uZoomStart)/max(.01,1.-uZoomStart),0.,1.);
    float zoomEase=zoomPhase*zoomPhase*(3.-2.*zoomPhase);
    float zoom=mix(uZoom,1.,zoomEase);
    vec2 span=cover(vec2(1.))-cover(vec2(0.));
    vec2 halfSpan=span/(2.*uZoom);
    vec2 initialCenter=clamp(uFocus,halfSpan,vec2(1.)-halfSpan);
    vec2 center=mix(initialCenter,vec2(.5),zoomEase);
    vec2 texUv=center+(cover(uv)-.5)/zoom;
    // Fine surface scatter adds texture without a visible lens silhouette.
    vec3 film=texture2D(uGrain,gl_FragCoord.xy/512.).rgb;
    vec2 surface=film.gb-.5;
    vec2 offset=((warp-.5)*.006+surface*.00045)*mask*uBlur;
    vec4 base=texture2D(uImage,texUv);
    base.rgb=mix(base.rgb,texture2D(uOriginal,texUv).rgb,uBrightnessReveal);
    if(uSelective>.5){texUv=uv;base=texture2D(uImage,uv);}
    // Text stays in screen coordinates, independent of the photo's zoom/crop.
    vec4 text=texture2D(uText,cover(uv));
    // Reveal each fixed text row independently after the background handoff.
    float sourceY=(1.-cover(uv).y)*3840.;
    float row=sourceY<1850.?0.:sourceY<2020.?1.:2.;
    float entryStart=.45+row*.12;
    float textEntry=smoothstep(entryStart,entryStart+.5,uEntryAge);
    text.a*=uTextOpacity*textEntry;
    vec4 a=texture2D(uBlurA,clamp(texUv+offset,0.001,.999));
    vec4 b=texture2D(uBlurB,clamp(texUv+offset,0.001,.999));
    vec4 c=texture2D(uBlurC,clamp(texUv+offset,0.001,.999));
    float amount=clamp(uBlur*localDepth*(.96+n*.08),0.,1.);
    // The smoothly joined field is differentiable where regions meet: no winning-region
    // switch, hard saturation, or separate opacity boundary in the clear-text study.
    // A soft norm preserves local clear gaps instead of accumulating full-frame haze.
    if(uClearText>.5)amount=(1.-exp(-sqrt(sqrt(depthEnergy))*.9))*uBlur*(1.-uFraming);
    // Composite fixed-size text before the shared frost treatment; only photo UVs zoom.
    vec4 sharedSoft=texture2D(uTextBlur,cover(uv+offset));
    sharedSoft.a*=uTextOpacity*textEntry;
    vec4 sharedText=mix(text,sharedSoft,smoothstep(0.,.35,amount));
    // Selective scenes already contain destination + photo in one opaque image.
    float participation=1.-uSelective;
    float sharedAlpha=sharedText.a*uCombined*participation;
    base.rgb=mix(base.rgb,text.rgb,text.a*uCombined*participation);
    vec3 blurred=mix(a.rgb,b.rgb,smoothstep(.0,.65,amount));
    blurred=mix(blurred,c.rgb,smoothstep(.45,1.,amount));
    if(uClearText>.5){
      // Feather the blur radius itself from sharp -> light -> medium -> deep.
      blurred=mix(base.rgb,a.rgb,smoothstep(0.,.34,amount));
      blurred=mix(blurred,b.rgb,smoothstep(.18,.70,amount));
      blurred=mix(blurred,c.rgb,smoothstep(.52,1.,amount));
    }
    blurred*=mix(1.,mix(2.,1./(1.-.18*uGlobalDim),uClearText),uBrightnessReveal*(1.-uSelective));
    blurred=mix(base.rgb,blurred,smoothstep(0.,.14,uBlur));
    blurred=mix(blurred,sharedText.rgb,sharedAlpha);
    // Lift only the frosted layers. Palette comes from the current image.
    vec3 lifted=pow(max(blurred,vec3(.001)),vec3(mix(.92,mix(.56,.82,uSelective),uLight)));
    float luminance=dot(lifted,vec3(.2126,.7152,.0722));
    lifted=clamp(mix(vec3(luminance),lifted,1.16),0.,1.);
    vec3 tint=(colorSum+uPalette[2]*.0001)/(colorWeight+.0001);
    vec3 frost=mix(lifted,tint,mix(.20+uColor*.24,.60+uColor*.35,uMode)*mix(1.,.20,uClearText));
    frost=mix(frost,uPalette[2],uLight*mix(.12,.045,uMode)*mix(1.,.08,uClearText));
    // Version 03: preserve the sampled photo colors. No tint, white veil,
    // gamma lift or saturation treatment participates in the frost.
    if(uClearText>.5)frost=blurred;
    // Screen-anchored grain: no frame-to-frame sparkle, feathers with the frost.
    float grain=(film.r-.5)*mix(.065,.035,uClearText);
    vec3 result=mix(base.rgb,frost,mask);
    if(uClearText>.5)result=frost;
    result+=grain*mask*uBlur;
    // Independent photo-only brightness; typography and its local shadow follow later.
    result=clamp(result*uPhotoBrightness,0.,1.);
    // One broad screen-space veil behind the whole text group. No row-shaped bands.
    vec2 textVeilDistance=(uv-vec2(.5,1.-1920./3840.))/vec2(.48,.13);
    float textVeil=.20*exp(-dot(textVeilDistance,textVeilDistance)*1.6)*uTextOpacity*uClearText;
    result*=1.-textVeil;
    // Independent foreground typography. Photo frost never affects this layer.
    float textPhase=uTextTime*6.2831853/uTextPeriod;
    // Independent frequencies bend the path in changing directions near the text.
    // Travel is bounded and independent of region size; no rotation or long offscreen gaps.
    float travelPhase=textPhase*.55;
    vec2 textCenter=uTextPosition;
    // One radius in frame-width units: equal pixel distances give a true circle.
    vec2 textDistance=(uv-textCenter)*vec2(uAspect,1.)/max(.0001,uTextRadius*uAspect);
    float textDistanceSquared=dot(textDistance,textDistance);
    float textProfile=clamp(exp(-textDistanceSquared*1.3)+(uTextCore-1.)*exp(-textDistanceSquared*4.5),0.,1.);
    float textMask=textProfile*uTextEnabled*uTextStrength*(1.-uFraming);
    // All three lines share this continuous field. Only the text is sampled;
    // a tighter scattering kernel avoids spreading each line into a white band.
    vec4 softText=texture2D(uTextBlur,cover(uv+surface*vec2(.0007,.0004)*textMask));
    // Concentrate extra scatter at the center while keeping the long feather unchanged.
    vec2 coreSpread=vec2(.0015,.00085)*max(0.,uTextCore-1.)*exp(-textDistanceSquared*4.5);
    softText=(softText+texture2D(uTextBlur,cover(uv+coreSpread))+texture2D(uTextBlur,cover(uv-coreSpread)))/3.;
    softText.a*=textEntry;
    float textAlpha=mix(text.a,softText.a,textMask);
    vec3 textColor=mix(text.rgb*text.a,softText.rgb*softText.a,textMask);
    // The soft sample also follows the ending's group opacity.
    textAlpha=mix(text.a,softText.a*uTextOpacity,textMask);
    textColor=mix(text.rgb*text.a,softText.rgb*softText.a*uTextOpacity,textMask);
    textColor*=1.-textMask*(.015+.05*film.r);
    // In the selective studies only the destination shares photo frost.
    // Destination belongs entirely to the shared frost; other lines stay clear.
    float foreground=1.-uCombined+uSelective;
    if(uSelective>.5){textAlpha=text.a; textColor=text.rgb*text.a;}
    textAlpha*=foreground;
    textColor*=foreground;
    result=result*(1.-textAlpha)+textColor;
    gl_FragColor=vec4(mix(result,vec3(1.),uWhiteExit),1.);
  }`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  let program;
  try { program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program); }
  catch(e){$('loading').textContent='Effect initialization failed';$('error').textContent=e.message;return;}
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const uniforms={};['uPhotoBrightness','uGlobalDim','uClearText','uTime','uTextTime','uProgress','uBlur','uSoft','uColor','uMode','uAspect','uImageAspect','uRadius','uLight','uZoom','uZoomStart','uFraming','uTextEnabled','uTextStrength','uTextPeriod','uTextRadius','uFocus','uTextPosition','uPhotoCore','uTextCore','uCombined','uSelective','uTitleY','uTextOpacity','uBrightnessReveal','uWhiteExit','uClouds[0]','uPalette[0]'].forEach(k=>uniforms[k]=gl.getUniformLocation(program,k));
  const textures=[];
  ['uImage','uBlurA','uBlurB','uBlurC','uText','uTextBlur','uGrain','uOriginal'].forEach((name,i)=>{const texture=gl.createTexture();textures.push(texture);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(gl.getUniformLocation(program,name),i);});
  // Independent random texels avoid precision-dependent diagonal shader patterns.
  // Averaging three samples gives fine film grain with fewer harsh black/white specks.
  const grainBytes=new Uint8Array(512*512*4);
  let grainSeed=0x572a19cf;
  function grainRandom(){grainSeed^=grainSeed<<13;grainSeed^=grainSeed>>>17;grainSeed^=grainSeed<<5;return (grainSeed>>>0)/4294967296;}
  for(let i=0;i<grainBytes.length;i+=4){grainBytes[i]=Math.round((grainRandom()+grainRandom()+grainRandom())*255/3);grainBytes[i+1]=Math.floor(grainRandom()*256);grainBytes[i+2]=Math.floor(grainRandom()*256);grainBytes[i+3]=255;}
  gl.activeTexture(gl.TEXTURE0+6);gl.bindTexture(gl.TEXTURE_2D,textures[6]);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,512,512,0,gl.RGBA,gl.UNSIGNED_BYTE,grainBytes);
  const sharedRenderer=selective?new window.SharedSceneRenderer(gl,buffer,vertex):null;
  gl.useProgram(program);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timeline=new window.InteractionTimeline();
  let ready=false,playing=true,progress=0,elapsed=0,last=0,mode=0,imageAspect=9/16,activeUrl=null,framing=false;
  let entryAge=10;
  const entryUniform=gl.getUniformLocation(program,'uEntryAge');
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  // Closed, continuous drifting paths remain alive while the answer-driven progress holds.
  function pathAt(time,layer){
    if(clearText){
      // Three overlapping vertical bands keep coverage balanced. Each pair follows
      // its own curved route, with unequal frequencies rather than a common orbit.
      const band=Math.floor(layer/2),side=layer%2;
      const phase=time*(.48+band*.047)+side*Math.PI+band*1.37;
      return {
        x:.5+.34*Math.sin(phase)+.095*Math.sin(time*.59+layer*1.61),
        y:[.18,.50,.82][band]+.13*Math.sin(phase*.83+band*.7)
          +.045*Math.cos(time*.43+layer*1.19)
      };
    }
    const phase=time*.55+layer*1.09;
    return {x:.5+.34*Math.sin(phase)+.13*Math.sin(phase*.5+layer*.9),
      y:.5+.36*Math.cos(phase*.5+layer*1.35)+.12*Math.sin(phase+layer*.7)};
  }
  let interactionState="";
  function interactionLabel(){
    const key=[ready,timeline.stage,!!timeline.transition,timeline.exitProgress===1,timeline.textExitProgress===1,timeline.ending.phase].join(":");
    if(key===interactionState)return;
    interactionState=key;
    const moving=!!timeline.transition;
    $('answer').disabled=!ready||moving||timeline.stage===3;
    $('answer').textContent=moving?'Revealing…':timeline.stage===3?'All questions complete':'Complete question '+(timeline.stage+1);
    $('stageStatus').textContent=moving?'Question '+timeline.stage+' answered · Zooming out':timeline.stage===3?(timeline.exitProgress<1?'Full view · Image frost moving away':timeline.textExitProgress<1?'Image frost cleared · Text frost moving away':(combined?'Reveal complete · Shared frost cleared':'Reveal complete · Both frost layers cleared')):timeline.stage===0?'Waiting for question 1 · Detail view held':'Waiting for question '+(timeline.stage+1)+' · View held';
    if(timeline.endingAge!==null)$('stageStatus').textContent=({ 'clear hold':'Clear view', 'text exit':'Text fading out', 'brightness restore':'Restoring original light', 'bright hold':'Full landscape', 'photo exit':'Transitioning to white', complete:'Complete - Ready for the next scene' })[timeline.ending.phase];
    document.querySelectorAll('[data-step]').forEach(el=>{const step=Number(el.dataset.step);el.classList.toggle('done',step<=timeline.stage);el.setAttribute('aria-current',step===timeline.stage+1?'step':'false');});
  }
  function hslToRgb(h,s,l){const a=s*Math.min(l,1-l);const channel=n=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return [channel(0),channel(8),channel(4)];}
  function imagePalette(img){
    const sample=document.createElement('canvas');sample.width=48;sample.height=80;
    const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,48,80);
    const pixels=ctx.getImageData(0,0,48,80).data;
    const buckets=[[],[]];
    for(let i=0;i<pixels.length;i+=4){
      const r=pixels[i]/255,g=pixels[i+1]/255,b=pixels[i+2]/255;
      const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;
      if(delta<.045||l>.84||l<.055)continue;
      let h=(max===r?(g-b)/delta+(g<b?6:0):max===g?(b-r)/delta+2:(r-g)/delta+4)*60;
      const s=delta/(1-Math.abs(2*l-1));
      if(h>165&&h<265)buckets[0].push([h,s,l]);
      if(h>20&&h<85)buckets[1].push([h,s,l]);
    }
    const avg=(bucket,fallback)=>{if(!bucket.length)return fallback;return [0,1,2].map(k=>bucket.reduce((a,v)=>a+v[k],0)/bucket.length);};
    const cool=avg(buckets[0],[207,.6,.3]),warm=avg(buckets[1],[43,.6,.3]);
    const blue=hslToRgb(cool[0],Math.max(.66,Math.min(.82,cool[1]*1.2)),.55);
    const gold=hslToRgb(warm[0],Math.max(.62,Math.min(.84,warm[1]*1.2)),.68);
    gl.uniform3fv(uniforms['uPalette[0]'],new Float32Array([...blue,...gold,.97,.975,.965]));
  }
  function playLabel(){ $('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause zoom (frost keeps moving)':'Resume zoom (frost keeps moving)'); }
  function replay(){framing=false;timeline.reset();progress=0;elapsed=0;entryAge=0;playing=true;playLabel();interactionLabel();}
  let retainedPhoto=null;
  function textureImage(img,original=img,restart=true){
    retainedPhoto={img,original};
    const maxSize=Math.min(2048,gl.getParameter(gl.MAX_TEXTURE_SIZE));
    const scale=Math.min(1,maxSize/Math.max(img.width,img.height));
    const w=Math.round(img.width*scale),h=Math.round(img.height*scale);
    const base=document.createElement('canvas');base.width=w;base.height=h;
    const baseContext=base.getContext('2d');baseContext.drawImage(clearText?original:img,0,0,w,h);
    // Version 03 uses the retained unshaded Figma photo, with an 18% global veil.
    if(clearText&&$('globalDim').checked){baseContext.fillStyle='rgba(0,0,0,0.18)';baseContext.fillRect(0,0,w,h);}
    // Typography is composited in screen space by the shader, never baked into zoomed pixels.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);imagePalette(img);
    for(let i=0;i<4;i++){
      let source=base;
      if(i){
        source=document.createElement('canvas');source.width=w;source.height=h;
        const ctx=source.getContext('2d');const radius=[0,9,28,70][i]*h/1536;
        // Duplicate the edge pixels so the blur never introduces a dark frame.
        const pad=Math.ceil(radius*3),padded=document.createElement('canvas');padded.width=w+pad*2;padded.height=h+pad*2;
        const p=padded.getContext('2d');p.drawImage(base,pad,pad);p.drawImage(base,0,0,w,1,pad,0,w,pad);p.drawImage(base,0,h-1,w,1,pad,pad+h,w,pad);p.drawImage(base,0,0,1,h,0,pad,pad,h);p.drawImage(base,w-1,0,1,h,pad+w,pad,pad,h);
        p.drawImage(base,0,0,1,1,0,0,pad,pad);p.drawImage(base,w-1,0,1,1,pad+w,0,pad,pad);p.drawImage(base,0,h-1,1,1,0,pad+h,pad,pad);p.drawImage(base,w-1,h-1,1,1,pad+w,pad+h,pad,pad);
        ctx.filter='blur('+radius+'px)';ctx.drawImage(padded,-pad,-pad);
      }
      gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,textures[i]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);
    }
    gl.activeTexture(gl.TEXTURE0+7);gl.bindTexture(gl.TEXTURE_2D,textures[7]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,original);
    imageAspect=img.width/img.height;ready=true;photo.classList.add('ready');$('error').textContent='';if(restart)replay();
    try{window.parent.postMessage({type:'frost:imageReady'},location.origin);}catch(e){}
  }
  function loadImage(url,originalUrl){
    const img=new Image();
    img.decoding='async';
    img.onload=()=>{
      if(originalUrl&&originalUrl!==url){
        const original=new Image();
        original.decoding='async';
        original.onload=()=>{try{textureImage(img,original);$('fallback').src=url;}catch(e){$('error').textContent='Image processing failed: '+e.message;try{window.parent.postMessage({type:'frost:imageError',message:String(e.message||e)},location.origin);}catch(_){}}};
        original.onerror=()=>{$('error').textContent='Original photo could not load. Please reload.';try{window.parent.postMessage({type:'frost:imageError',message:'original load failed'},location.origin);}catch(_){}};
        original.src=originalUrl;
        return;
      }
      try{textureImage(img);$('fallback').src=url;}catch(e){$('error').textContent='Image processing failed: '+e.message;try{window.parent.postMessage({type:'frost:imageError',message:String(e.message||e)},location.origin);}catch(_){}}
    };
    img.onerror=()=>{$('loading').textContent='Photo could not load';$('error').textContent='Select another image using Replace photo.';try{window.parent.postMessage({type:'frost:imageError',message:'image load failed'},location.origin);}catch(_){}};
    img.src=url;
  }
  function resize(){const r=photo.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.7);const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}}
  new ResizeObserver(resize).observe(photo);
  function frame(now){
    requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(!ready)return;
    entryAge+=dt;
    timeline.running=playing;
    timeline.tick(dt,Number($('photoSpeed').value),Number($('textSpeed').value));
    progress=timeline.progress;elapsed=timeline.photoTime;
    interactionLabel();
    const clouds=Array.from({length:12},(_,i)=>{
      const layer=i%6,isTrail=i>=6;
      const position=pathAt(Math.max(0,elapsed-(isTrail?1.4:0)),layer);
      const pulseTime=timeline.exitAge===null?elapsed:timeline.exitPhotoTime;
      // Complementary breathing within each pair prevents an entire band going
      // quiet while another band becomes the only visible frost.
      const pulse=clearText?.53+.42*Math.sin(pulseTime*(.51+Math.floor(layer/2)*.061)
        +Math.floor(layer/2)*1.4+(layer%2)*Math.PI)
        :.15+.85*Math.pow(.5+.5*Math.sin(pulseTime*.4+layer*1.7),3);
      // Reveal by moving the regions away, never by reducing their opacity.
      const directions=[[-1,.65],[1,.45],[-.8,-.8],[1,-.6],[-1,-.35],[.8,.9]];
      const direction=directions[layer];
      const priorReveal=smooth(0,.55,progress)*(clearText?.035:[.05,.38,.2,.06,.5,.3][layer]);
      const exitMove=smooth(layer*.012,1.,timeline.exitProgress);
      const distance=priorReveal+exitMove*2.8;
      position.x+=direction[0]*distance;
      position.y+=direction[1]*distance;
      const weight=clearText?[.90,.86,.90,.86,.90,.86][layer]:[1,.9,.8,.76,.55,.48][layer];
      const envelope=weight*pulse;
      const scale=.92+(layer%3)*.12;
      return {...position,radius:scale*(isTrail?1.08:1),strength:envelope*(isTrail?.14:1)};
    });
    updateLoadingDots(now);
    resize();
    if(sharedRenderer){
      sharedRenderer.render(textures,canvas.width,canvas.height,{aspect:canvas.width/canvas.height,imageAspect,zoom:Number($('zoom').value),progress,brightness:timeline.ending.brightness,opacity:timeline.ending.textOpacity,focus:[Number($('focusX').value),1-Number($('focusY').value)]});
    }
    gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    gl.uniform1f(uniforms.uPhotoBrightness,clearText?Number($('photoBrightness').value):1);gl.uniform1f(uniforms.uGlobalDim,clearText&&$('globalDim').checked?1:0);gl.uniform1f(uniforms.uClearText,clearText?1:0);gl.uniform1f(uniforms.uTime,elapsed);gl.uniform1f(uniforms.uTextTime,timeline.textTime);gl.uniform1f(uniforms.uProgress,progress);gl.uniform1f(uniforms.uBlur,Number($('blur').value));gl.uniform1f(uniforms.uSoft,Number($('soft').value));gl.uniform1f(uniforms.uColor,Number($('color').value));gl.uniform1f(uniforms.uMode,mode);gl.uniform1f(uniforms.uAspect,canvas.width/canvas.height);gl.uniform1f(uniforms.uImageAspect,imageAspect);
    const coverage=window.InteractionTimeline.coverageAt(progress,[Number($('radius').value),Number($('radius1').value),Number($('radius2').value),Number($('radius2').value)]);
    gl.uniform1f(uniforms.uRadius,coverage*.5625/200);
    $('radiusCurrentOut').textContent=timeline.exitProgress===1?'Offscreen':Math.round(coverage)+'% of frame width'+(timeline.exitAge!==null?' · Moving away':'');
    gl.uniform1f(uniforms.uLight,Number($('light').value));gl.uniform1f(uniforms.uZoom,Number($('zoom').value));
    gl.uniform1f(uniforms.uFraming,framing?1:0);
    gl.uniform1f(uniforms.uCombined,combined||selective?1:0);
    gl.uniform1f(uniforms.uSelective,selective?1:0);gl.uniform1f(uniforms.uTitleY,1-destinationY);
    const ending=timeline.ending;
    gl.uniform1f(entryUniform,entryAge);
    gl.uniform1f(uniforms.uTextOpacity,ending.textOpacity);gl.uniform1f(uniforms.uBrightnessReveal,ending.brightness);gl.uniform1f(uniforms.uWhiteExit,ending.white);
    canvas.dataset.entryAge=entryAge.toFixed(3);
    canvas.dataset.endingPhase=ending.phase;
    gl.uniform1f(uniforms.uTextEnabled,!clearText&&!combined&&!selective&&$('textEffect').checked?1:0);
    gl.uniform1f(uniforms.uTextStrength,Number($('textStrength').value));
    gl.uniform1f(uniforms.uTextPeriod,Number($('textPeriod').value));
    gl.uniform1f(uniforms.uTextRadius,Number($('textRadius').value));
    gl.uniform1f(uniforms.uPhotoCore,Number($('photoCore').value));
    gl.uniform1f(uniforms.uTextCore,Number($('textCore').value));
    const textMotionTime=timeline.textExitAge===null?timeline.textTime:timeline.textExitTime;
    const textTravelPhase=textMotionTime*6.2831853/Number($('textPeriod').value)*.55;
    const textExit=smooth(0,1,timeline.textExitProgress);
    const textX=.5+.115*Math.sin(textTravelPhase+.4)+.065*Math.sin(textTravelPhase*1.67+1.2)+textExit*4.;
    const textY=.5+.18*Math.sin(textTravelPhase*.81-.5)+.075*Math.sin(textTravelPhase*1.49+.8)+textExit*3.;
    gl.uniform2f(uniforms.uTextPosition,textX,textY);
    gl.uniform1f(uniforms.uZoomStart,0);
    gl.uniform2f(uniforms.uFocus,Number($('focusX').value),1-Number($('focusY').value));
    gl.uniform4fv(uniforms['uClouds[0]'],new Float32Array(clouds.flatMap(p=>[p.x,p.y,p.radius,p.strength])));gl.drawArrays(gl.TRIANGLES,0,6);
    canvas.dataset.textCenterX=textX.toFixed(3);canvas.dataset.textCenterY=textY.toFixed(3);
    canvas.dataset.textExitProgress=timeline.textExitProgress.toFixed(3);
    canvas.dataset.exitProgress=timeline.exitProgress.toFixed(3);canvas.dataset.photoTime=timeline.photoTime.toFixed(3);canvas.dataset.textTime=timeline.textTime.toFixed(3);
    $('progress').value=progress;$('percent').textContent=Math.round(progress*100)+'%';
  }
  $('play').onclick=()=>{framing=false;playing=!playing;playLabel();};$('replay').onclick=replay;
  function answerQuestion(question){
    if(!ready)return false;
    const accepted=timeline.answer(question,reduced?0:Number($('transitionDuration').value),Number($('exitDuration').value));
    if(accepted){framing=false;playing=true;playLabel();interactionLabel();}
    return accepted;
  }
  $('answer').onclick=()=>answerQuestion(timeline.stage+1);
  window.addEventListener('frost:answer',event=>answerQuestion(event.detail?.question));
  ['blur','soft','color','radius','radius1','radius2','light','zoom','focusX','focusY','textStrength','textRadius','photoSpeed','textSpeed','transitionDuration','exitDuration','photoCore','textCore'].forEach(id=>{$(id).oninput=()=>{
    const value=Number($(id).value);
    $(id+'Out').textContent=['transitionDuration','exitDuration'].includes(id)?value+' sec':id==='zoom'||id==='photoSpeed'||id==='textSpeed'?value.toFixed(2)+'×':id==='textRadius'?Math.round(value*200)+'% of frame width':['radius','radius1','radius2'].includes(id)?Math.round(value)+'% of frame width':Math.round(value*100)+'%';
  };});
  function selectMode(value){mode=value;document.querySelectorAll('.preset').forEach(b=>{const selected=Number(b.dataset.mode)===mode;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});}
  document.querySelectorAll('.preset').forEach(b=>b.onclick=()=>selectMode(Number(b.dataset.mode)));
  if(clearText)$('photoBrightness').oninput=()=>{$('photoBrightnessOut').textContent=Math.round(Number($('photoBrightness').value)*100)+'%';};
  if(clearText)$('globalDim').onchange=()=>{if(retainedPhoto)textureImage(retainedPhoto.img,retainedPhoto.original,false);};
  $('reset').onclick=()=>{if(clearText){$('globalDim').checked=$('globalDim').defaultChecked;$('globalDim').onchange();}document.querySelectorAll('input[type="range"]').forEach(input=>{if(input.id==='progress')return;input.value=input.defaultValue;if(input.oninput)input.oninput();});$('textEffect').checked=$('textEffect').defaultChecked;selectMode(0);replay();};
  $('startFrame').onclick=()=>{replay();framing=true;};
  $('upload').onchange=e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){$('error').textContent='Please select an image file.';return;}if(activeUrl)URL.revokeObjectURL(activeUrl);activeUrl=URL.createObjectURL(file);loadImage(activeUrl);};
  function fitPresentation(){
    if(!viewer.classList.contains('presentation'))return;
    const panel=viewer.querySelector('.question-panel');
    const bounds=viewer.getBoundingClientRect();
    const availableHeight=Math.max(1,bounds.height-panel.getBoundingClientRect().height-viewer.querySelector('.transport').getBoundingClientRect().height-48);
    const height=Math.min(availableHeight,Math.max(1,bounds.width-24)*16/9);
    viewer.style.setProperty('--presentation-photo-height',height+'px');
    viewer.style.setProperty('--presentation-photo-width',(height*9/16)+'px');
    resize();
  }
  function leavePresentation(){viewer.classList.remove('presentation');document.body.classList.remove('presenting');$('fullscreen').textContent='⤢';$('fullscreen').setAttribute('aria-label','Full screen');resize();}
  $('fullscreen').onclick=async()=>{
    if(viewer.classList.contains('presentation')){
      if(document.fullscreenElement)await document.exitFullscreen();
      leavePresentation();return;
    }
    viewer.classList.add('presentation');document.body.classList.add('presenting');
    $('fullscreen').textContent='×';$('fullscreen').setAttribute('aria-label','Exit full screen');
    fitPresentation();
    try{await viewer.requestFullscreen();}catch(e){/* The same black presentation fits inside the browser when native fullscreen is unavailable. */}
    fitPresentation();
  };
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)leavePresentation();else fitPresentation();});
  window.addEventListener('resize',fitPresentation);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.fullscreenElement)leavePresentation();});
  try{new ResizeObserver(fitPresentation).observe(viewer.querySelector('.question-panel'));}catch(e){/* host may hide panel */}

  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;$('error').textContent='Graphics interrupted. Reload to recover.';});
  // Formal-app host: clear-text frost without baked typography SVGs.
  function updateLoadingDots(){/* caption is HTML in the host app */}
  function seedEmptyTextTextures(){
    const blank=document.createElement('canvas');blank.width=2;blank.height=2;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    for(const unit of [4,5]){
      gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,textures[unit]);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,blank);
    }
  }
  function setImage(url,originalUrl){
    if(!url)return;
    loadImage(url,originalUrl||url);
  }
  window.frostStudy={
    answerQuestion,
    restart:replay,
    setImage,
    settleNow(){
      if(timeline.transition){
        timeline.progress=timeline.transition.to;
        timeline.transition=null;
      }
    },
    holdPhotoExit(){timeline.holdPhotoExit=true;},
    requestPhotoExit(){timeline.requestPhotoExit();},
    getState:()=>({ready,playing,progress,stage:timeline.stage,transitioning:!!timeline.transition,photoTime:timeline.photoTime,textTime:timeline.textTime,mode,imageAspect,ending:timeline.ending,endingAge:timeline.endingAge,error:gl.getError()})
  };
  playLabel();
  seedEmptyTextTextures();
  requestAnimationFrame(frame);
  window.parent.postMessage({type:'frost:ready'},location.origin);
})();
document.addEventListener('keydown',event=>{if(event.key==='Escape')parent.postMessage({type:'preview:escape'},location.origin);});
