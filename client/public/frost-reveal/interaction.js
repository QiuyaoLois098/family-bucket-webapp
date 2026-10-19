/* Answer-driven reveal and two independent continuous motion clocks. */
(() => {
  class InteractionTimeline {
    constructor(){this.reset();}
    static coverageAt(progress,values){
      const stops=[0,.25,.55,1];
      const p=Math.max(0,Math.min(1,progress));
      for(let i=1;i<stops.length;i++)if(p<=stops[i]){
        const amount=(p-stops[i-1])/(stops[i]-stops[i-1]);
        return values[i-1]+(values[i]-values[i-1])*amount;
      }
      return values[3];
    }
    reset(){this.stage=0;this.progress=0;this.photoTime=0;this.textTime=0;this.transition=null;this.running=true;this.exitAge=null;this.exitDuration=6;this.exitPhotoTime=0;this.textExitAge=null;this.textExitTime=0;this.endingAge=null;this.holdPhotoExit=this.holdPhotoExit??false;this.photoExitRequested=false;this.photoExitAge=null;}
    requestPhotoExit(){this.photoExitRequested=true;}
    get ending(){
      const age=this.endingAge??0;
      const ease=(start,duration)=>{const p=Math.max(0,Math.min(1,(age-start)/duration));return p*p*(3-2*p);};
      const textPhase=this.exitAge===null?0:Math.max(0,Math.min(1,(this.exitAge-.55)/1.1));
      const finalPhase=this.exitProgress;
      const exitAge=this.holdPhotoExit?this.photoExitAge:Math.max(0,age-1.5);
      const white=exitAge===null?0:Math.max(0,Math.min(1,exitAge/.5));
      return {textOpacity:1-textPhase*textPhase*(3-2*textPhase),brightness:finalPhase*finalPhase*(3-2*finalPhase),white:white*white*(3-2*white),phase:this.endingAge===null?'reveal':age<1.5||exitAge===null?'bright hold':exitAge<.5?'photo exit':'complete'};
    }
    answer(question,duration=3,exitDuration=6){
      if(this.transition||this.stage===3||question!==this.stage+1)return false;
      this.stage=question;
      if(question===3){this.exitAge=0;this.exitDuration=Math.max(.1,exitDuration);this.exitPhotoTime=this.photoTime;this.textExitAge=0;this.textExitTime=this.textTime;}
      this.transition={from:this.progress,to:[0,.25,.55,1][question],age:0,duration:Math.max(0,question===3?this.exitDuration:duration)};
      this.running=true;
      return true;
    }
    get exitProgress(){return this.exitAge===null?0:Math.min(1,this.exitAge/this.exitDuration);}
    get textExitProgress(){return this.textExitAge===null?0:Math.min(1,this.textExitAge/3);}
    tick(dt,photoSpeed,textSpeed){
      if(this.endingAge!==null)this.endingAge+=dt;
      if(this.holdPhotoExit&&this.endingAge!==null&&this.endingAge>=1.5&&this.photoExitRequested){
        this.photoExitAge=this.photoExitAge===null?0:this.photoExitAge+dt;
      }
      this.photoTime+=dt*photoSpeed;
      this.textTime+=dt*textSpeed;
      if(this.exitAge!==null)this.exitAge=Math.min(this.exitDuration,this.exitAge+dt);
      if(this.running&&this.transition){
      const t=this.transition;
      t.age+=dt;
      const phase=t.duration===0?1:Math.min(1,t.age/t.duration);
      const eased=phase*phase*(3-2*phase);
      this.progress=t.from+(t.to-t.from)*eased;
      if(phase===1){this.progress=t.to;this.transition=null;}
      }
      if(this.textExitAge!==null)this.textExitAge=Math.min(3,this.textExitAge+dt);
      if(this.endingAge===null&&this.stage===3&&!this.transition&&this.exitProgress===1&&this.textExitProgress===1)this.endingAge=0;
    }
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=InteractionTimeline;
  else window.InteractionTimeline=InteractionTimeline;
})();
