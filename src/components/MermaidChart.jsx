import { useEffect, useRef, useState } from 'react'
import './MermaidChart.css'

function MermaidChart({ chart, id }) {
  const chartRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const chartId = id || `mermaid-${Math.random().toString(36).substring(2, 11)}`

  useEffect(() => {
    let mounted = true

    const renderChart = async () => {
      if (!chart || !chartRef.current) return

      try {
        // Dynamic import - загружаем Mermaid только когда компонент монтируется
        const mermaid = (await import('mermaid')).default

        if (!mounted) return

        // Инициализация с темной темой
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#1a1d29',
            primaryTextColor: '#FFFFFF',
            primaryBorderColor: '#3A86FF',
            lineColor: '#3A86FF',
            secondaryColor: '#8338EC',
            tertiaryColor: '#2a2d3a',
            background: 'transparent',
            mainBkg: 'rgba(26, 29, 41, 0.6)',
            secondBkg: 'rgba(58, 134, 255, 0.1)',
            tertiaryBkg: 'rgba(131, 56, 236, 0.1)',
            textColor: '#FFFFFF',
            border1: '#3A86FF',
            border2: '#8338EC',
            arrowheadColor: '#3A86FF',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            nodeBorder: '#3A86FF',
            clusterBkg: 'rgba(26, 29, 41, 0.4)',
            clusterBorder: '#3A86FF',
            defaultLinkColor: '#3A86FF',
            titleColor: '#FFFFFF',
            edgeLabelBackground: 'rgba(26, 29, 41, 0.8)',
            nodeTextColor: '#FFFFFF'
          },
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            padding: 15,
            nodeSpacing: 50,
            rankSpacing: 50,
            diagramPadding: 8,
            useMaxWidth: true
          },
          securityLevel: 'loose'
        })

        // Рендерим диаграмму
        chartRef.current.innerHTML = chart
        chartRef.current.removeAttribute('data-processed')
        
        await mermaid.run({
          nodes: [chartRef.current],
          suppressErrors: true
        })

        if (mounted) {
          setIsLoaded(true)
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        if (mounted) {
          setError('Не удалось загрузить диаграмму')
        }
      }
    }

    renderChart()

    return () => {
      mounted = false
    }
  }, [chart])

  if (!chart) {
    return null
  }

  if (error) {
    return <div className="mermaid-error">{error}</div>
  }

  return (
    <div className="mermaid-container">
      {!isLoaded && <div className="mermaid-loading">Загрузка диаграммы...</div>}
      <div 
        ref={chartRef}
        className="mermaid"
        id={chartId}
      >
        {chart}
      </div>
    </div>
  )
}

export default MermaidChart
