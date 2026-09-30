import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PROJECTS, projectFromPath } from "../projects.js";

export default function ProjectMenu({ hideOnPaths } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inFrame, setInFrame] = useState(true);
  const current = projectFromPath(location.pathname);
  const hidden =
    inFrame ||
    (hideOnPaths instanceof Set
      ? hideOnPaths.has(location.pathname)
      : Array.isArray(hideOnPaths)
        ? hideOnPaths.includes(location.pathname)
        : location.pathname === "/sarah");

  useEffect(() => {
    setInFrame(window.self !== window.top);
  }, []);

  useEffect(() => {
    document.title = "Expedia Interaction Demo";
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (hidden) return null;

  return (
    <div className={`project-menu ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="project-menu__toggle"
        aria-label="Open projects menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      {open ? (
        <>
          <button type="button" className="project-menu__backdrop" aria-label="Close projects menu" onClick={() => setOpen(false)} />
          <nav className="project-menu__drawer" aria-label="Projects">
            <p className="project-menu__eyebrow">Projects</p>
            <ul>
              {PROJECTS.filter((project) => !project.hidden).map((project) => {
                const active = project.id === current.id;
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={active ? "is-active" : ""}
                      onClick={() => {
                        if (!active) navigate(project.path);
                        setOpen(false);
                      }}
                    >
                      <strong>{project.title}</strong>
                      <span>{project.subtitle}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
