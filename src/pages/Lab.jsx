import React, { useState, useEffect } from 'react'
import ProjectCard from '../components/ProjectCard'
import './Lab.css'

function Lab() {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/projects.json')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setFilteredProjects(data)
        
        // Собираем все уникальные теги
        const tags = new Set()
        data.forEach(project => {
          project.tags.forEach(tag => tags.add(tag))
        })
        setAllTags(Array.from(tags).sort())
        
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading projects:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project =>
        selectedTags.every(tag => project.tags.includes(tag))
      )
      setFilteredProjects(filtered)
    }
  }, [selectedTags, projects])

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedTags([])
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="lab">
      <section className="lab-header">
        <h1 className="lab-title">
          <span className="accent-text">{'</>'}</span> Project Lab
        </h1>
        <p className="lab-subtitle">
          All projects with filtering by technologies and categories
        </p>
      </section>

      <section className="filters">
        <div className="filters-header">
          <h3 className="filters-title">Filter by Technology:</h3>
          {selectedTags.length > 0 && (
            <button className="clear-btn" onClick={clearFilters}>
              Clear ({selectedTags.length})
            </button>
          )}
        </div>
        <div className="tags-filter">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`filter-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="lab-projects">
        <div className="projects-count">
          Projects found: <span className="count-number">{filteredProjects.length}</span>
        </div>
        <div className="projects-grid">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {filteredProjects.length === 0 && (
          <div className="no-results">
            <p>No projects found</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Lab
