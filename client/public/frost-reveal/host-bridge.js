(() => {
  const origin = window.location.origin;
  let appliedAnswers = 0;
  let pendingAnswers = null;

  function syncAnswers(answerCount) {
    const study = window.frostStudy;
    if (!study?.getState) return;
    if (!study.getState().ready) {
      pendingAnswers = answerCount;
      return;
    }

    const target = Math.max(0, Math.min(3, Number(answerCount) || 0));
    if (target < appliedAnswers) {
      study.restart();
      appliedAnswers = 0;
    }

    while (appliedAnswers < target) {
      const next = appliedAnswers + 1;
      const animateLatest = next === target;
      const duration = animateLatest ? 3 : 0;
      const ok = study.answerQuestion(next, duration, 6);
      if (!ok) break;
      if (!animateLatest) study.settleNow?.();
      appliedAnswers = next;
    }
    pendingAnswers = null;
  }

  const waitReady = () => {
    const study = window.frostStudy;
    if (!study) {
      requestAnimationFrame(waitReady);
      return;
    }

    const original = study.answerQuestion;
    study.answerQuestion = (question, duration, exitDuration) => {
      const t = document.getElementById("transitionDuration");
      const e = document.getElementById("exitDuration");
      const prevT = t.value;
      const prevE = e.value;
      if (duration != null) t.value = String(duration);
      if (exitDuration != null) e.value = String(exitDuration);
      const ok = original(question);
      t.value = prevT;
      e.value = prevE;
      return ok;
    };

    const originalSetImage = study.setImage;
    study.setImage = (url, originalUrl) => {
      appliedAnswers = 0;
      originalSetImage(url, originalUrl);
    };

    window.addEventListener("message", (event) => {
      if (event.origin !== origin) return;
      const message = event.data;
      if (!message || typeof message !== "object") return;

      if (message.type === "frost:setImage") {
        appliedAnswers = 0;
        pendingAnswers = null;
        study.setImage(message.url, message.originalUrl || message.url);
      }
      if (message.type === "frost:setAnswers") {
        syncAnswers(message.answerCount);
      }
      if (message.type === "frost:restart") {
        appliedAnswers = 0;
        pendingAnswers = null;
        study.restart();
      }
    });

    // Flush queued answers once the photo hits the GPU.
    const flush = () => {
      if (pendingAnswers != null && study.getState()?.ready) {
        syncAnswers(pendingAnswers);
      }
      requestAnimationFrame(flush);
    };
    requestAnimationFrame(flush);
  };

  waitReady();
})();
