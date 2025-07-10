import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

const LEVELS = [0, 1, 2, 3];

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [pool, setPool] = useState([]);

  // 1. Загрузка из localStorage
  useEffect(() => {
  const poolRaw = localStorage.getItem('skillsPool');
  const savedRaw = localStorage.getItem('skills');

  try {
    const poolParsed = poolRaw ? JSON.parse(poolRaw) : [];
    const savedParsed = savedRaw ? JSON.parse(savedRaw) : [];

    const merged = poolParsed.map(skill => {
      const existing = savedParsed.find(s => s.name === skill.name);
      return {
        name: skill.name,
        category: skill.category,
        level: typeof existing?.level === 'number' ? existing.level : 0
      };
    });

    if (merged.length > 0) setSkills(merged);
    setPool(poolParsed);
  } catch (e) {
    console.error('Ошибка при загрузке навыков:', e);
  }
}, []);


  // 2. Сохраняем при изменениях
  useEffect(() => {
  if (skills.length > 0) {
    const toSave = skills.map(({ name, level }) => ({ name, level }));
    localStorage.setItem('skills', JSON.stringify(toSave));
  }
}, [skills]);


  const updateSkill = (index, level) => {
    const updated = [...skills];
    updated[index].level = level;
    setSkills(updated);
  };

  return (
    <div style={{ padding: 20 }}>
      <NavBar />
      <h2>Навыки сотрудника</h2>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#333' }}>
            <th style={thStyle}>№</th>
            <th style={thStyle}>Навык</th>
            <th style={thStyle}>Категория</th>
            <th style={thStyle}>Уровень</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill, index) => (
            <tr key={index}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>{skill.name}</td>
              <td style={tdStyle}>{skill.category}</td>
              <td style={tdStyle}>
                <select
                  value={skill.level}
                  onChange={e => updateSkill(index, parseInt(e.target.value))}
                  style={{ padding: 4 }}
                >
                  {LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '8px',
  backgroundColor: '#2a2a2a',
  color: '#fff',
  border: '1px solid #444',
  textAlign: 'left'
};

const tdStyle = {
  padding: '6px',
  border: '1px solid #444',
  backgroundColor: '#1e1e1e',
  color: '#fff'
};
