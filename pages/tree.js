import React, { useEffect, useState } from 'react'
import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import NavBar from '../components/NavBar' // добавь импорт

const levelColors = ['#e5e7eb', '#86efac', '#60a5fa', '#a78bfa']

export default function SkillTree() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [skills, setSkills] = useState({})
  const [gradeLevels, setGradeLevels] = useState({})
  const [requirements, setRequirements] = useState([])

  const [targetGrade, setTargetGrade] = useState('Jun')
  const [targetLevel, setTargetLevel] = useState(0)
  const [targetChecklist, setTargetChecklist] = useState([])

  useEffect(() => {
    const reqRaw = localStorage.getItem('requirements')
    const skRaw = localStorage.getItem('skills')
    if (!reqRaw || !skRaw) return

    const reqs = JSON.parse(reqRaw)
    const skillList = JSON.parse(skRaw)

    const skillMap = {}
    skillList.forEach((s) => {
      skillMap[s.name] = s.level
    })

    const gradeList = ['Jun', 'Mid', 'Sen', 'Lead']
    const gradeMap = {}
    gradeList.forEach((g) => (gradeMap[g] = 0))

    const canReach = (grade, level) => {
      const conds = reqs.filter(
        (r) => r.grade === grade && r.level === level
      )
      return conds.every((r) => {
        if (r.type === 'skill') {
          return (skillMap[r.skill] || 0) >= r.required
        } else if (r.type === 'grade') {
          return (gradeMap[r.skill] || 0) >= r.required
        }
        return false
      })
    }

    gradeList.forEach((grade) => {
      for (let lvl = 0; lvl <= 3; lvl++) {
        if (canReach(grade, lvl)) {
          gradeMap[grade] = lvl
        } else {
          break
        }
      }
    })

    setSkills(skillMap)
    setGradeLevels(gradeMap)
    setRequirements(reqs)

    // Построение графа
    const nodesOut = []
    gradeList.forEach((grade, i) => {
      const lvl = gradeMap[grade]

      const bar = (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  marginRight: idx < 3 ? 4 : 0,
                  backgroundColor: idx === lvl ? levelColors[lvl] : '#d1d5db',
                }}
              />
            ))}
          </div>
          <div style={{ fontWeight: 600 }}>{grade}</div>
        </div>
      )

      nodesOut.push({
        id: grade,
        data: { label: bar },
        position: { x: 400, y: i * 130 },
        style: {
          backgroundColor: '#111',
          borderRadius: 6,
          padding: 6,
          width: 90,
          textAlign: 'center',
          color: '#fff',
        },
      })
    })

    const skillNames = [
      ...new Set(
        reqs
          .filter((r) => r.type === 'skill')
          .map((r) => r.skill)
      ),
    ]

    let x = 100
    let y = 0
    skillNames.forEach((s) => {
      nodesOut.push({
        id: `skill-${s}`,
        data: { label: s },
        position: { x, y },
        style: {
          backgroundColor: levelColors[skillMap[s] || 0],
          padding: 8,
          borderRadius: 6,
        },
      })
      y += 80
    })

    const edgesOut = []
    reqs.forEach((r, i) => {
      const target = r.grade
      const color = levelColors[r.required]
      const source = r.type === 'skill' ? `skill-${r.skill}` : r.skill

      edgesOut.push({
        id: `e-${i}`,
        source,
        target,
        animated: true,
        style: { stroke: color },
      })
    })

    setNodes(nodesOut)
    setEdges(edgesOut)
  }, [])

  useEffect(() => {
  if (!requirements.length || !skills) return

  const collected = []

  // Проверяем рекурсивно все уровни до targetLevel
  const collectRequirements = (grade, level) => {
    if (level < 0) return

    const alreadyReached = (gradeLevels[grade] || 0) >= level
    if (alreadyReached) return

    const reqs = requirements.filter(
      (r) => r.grade === grade && r.level === level
    )

    reqs.forEach((r) => {
      const actual = r.type === 'skill'
        ? (skills[r.skill] || 0)
        : (gradeLevels[r.skill] || 0)

      const ok = actual >= r.required
      collected.push({
        ...r,
        actual,
        ok,
      })

      if (!ok && r.type === 'grade') {
        // Рекурсивно собираем для зависимости-грейда
        collectRequirements(r.skill, r.required)
      }
    })

    // Проверяем предыдущий уровень текущего грейда
    collectRequirements(grade, level - 1)
  }

  collectRequirements(targetGrade, targetLevel)

  setTargetChecklist(collected)

  const edgesOut = collected
    .filter((item) => !item.ok)
    .map((item, i) => {
      const source = item.type === 'skill' ? `skill-${item.skill}` : item.skill
      const target = item.grade
      const color = levelColors[item.required]

      return {
        id: `edge-${i}`,
        source,
        target,
        animated: true,
        style: { stroke: color },
      }
    })

  setEdges(edgesOut)
}, [targetGrade, targetLevel, requirements, skills, gradeLevels])


  return (
    <div style={{ width: '100vw', height: '100vh' }}>
	<NavBar /> {/* 🔹 вставлен компонент навигации */}
      <div style={{ padding: 10, backgroundColor: '#111', color: '#fff' }}>
        🎯 Цель:
        <select
          value={targetGrade}
          onChange={(e) => setTargetGrade(e.target.value)}
          style={{ marginLeft: 10, marginRight: 10 }}
        >
          {['Jun', 'Mid', 'Sen', 'Lead'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={targetLevel}
          onChange={(e) => setTargetLevel(parseInt(e.target.value))}
        >
          {[0, 1, 2, 3].map((lvl) => (
            <option key={lvl} value={lvl}>
              Уровень {lvl}
            </option>
          ))}
        </select>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>

      {targetChecklist.length > 0 && (
        <div style={{ padding: 16, backgroundColor: '#222', color: '#fff' }}>
          <h4>🔍 Требования для {targetGrade} {targetLevel}</h4>
          <ul>
            {targetChecklist.map((item, i) => (
              <li key={i} style={{ color: item.ok ? '#86efac' : '#f87171' }}>
                {item.type === 'skill' ? 'Навык' : 'Грейд'} <b>{item.name}</b>: нужно ≥ {item.required}, сейчас {item.actual}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
