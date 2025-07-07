import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'

const LEVELS = [0, 1, 2, 3]

export default function SkillsPage() {
  const [skills, setSkills] = useState([])

  useEffect(() => {
    const requirementsRaw = localStorage.getItem('requirements')
    if (!requirementsRaw) return

    const requirements = JSON.parse(requirementsRaw)
    const uniqueSkills = [
      ...new Set(
        requirements
          .filter((r) => r.type === 'skill') // исключаем грейды
          .map((r) => r.skill)
      ),
    ]

    const saved = localStorage.getItem('skills')
    const savedSkills = saved ? JSON.parse(saved) : []

    const mergedSkills = uniqueSkills.map((name) => {
      const existing = savedSkills.find((s) => s.name === name)
      return {
        name,
        level: existing ? existing.level : 0,
      }
    })

    setSkills(mergedSkills)
  }, [])

  useEffect(() => {
    localStorage.setItem('skills', JSON.stringify(skills))
  }, [skills])

  const updateSkill = (index, level) => {
    const updated = [...skills]
    updated[index].level = level
    setSkills(updated)
  }

  return (
    <div style={{ padding: 20 }}>
      <NavBar />
      <h2>Навыки сотрудника</h2>
      <table>
        <thead>
          <tr>
            <th>Навык</th>
            <th>Уровень</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill, index) => (
            <tr key={index}>
              <td>{skill.name}</td>
              <td>
                <select
                  value={skill.level}
                  onChange={(e) => updateSkill(index, parseInt(e.target.value))}
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
