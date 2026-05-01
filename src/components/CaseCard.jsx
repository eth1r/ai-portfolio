import React from "react";
import { Link } from "react-router-dom";
import "./CaseCard.css";

function CaseCard({ project }) {
  return (
    <div className="case-card">
      <div className="case-header">
        <span className="case-category">{project.category}</span>
        <h3 className="case-title">{project.title}</h3>
        <p className="case-audience">{project.audience}</p>
      </div>

      <p className="case-pitch">{project.short_pitch}</p>

      <div className="case-result">
        <div className="result-headline">{project.result.headline}</div>
        <div className="result-metrics">
          {project.result.metrics.slice(0, 2).map((metric, index) => (
            <div key={index} className="metric-item">
              <span className="metric-value">{metric.value}</span>
              <span className="metric-label">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="case-services">
        {project.services_used.slice(0, 3).map((service, index) => (
          <span key={index} className="service-tag">
            {service}
          </span>
        ))}
      </div>

      <div className="case-actions">
        <Link to={`/cases/${project.slug}`} className="btn btn-outline">
          Подробнее →
        </Link>
        {project.demoWidget?.enabled && (
          <Link
            to={`/cases/${project.slug}#demo`}
            className="btn btn-primary btn-demo"
          >
            Попробовать демо
          </Link>
        )}
        {project.links?.github && project.links.github !== "#" && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="case-github-link"
          >
            Код на GitHub →
          </a>
        )}
      </div>
    </div>
  );
}

export default CaseCard;
