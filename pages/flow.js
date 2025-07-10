import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import NavBar from '../components/NavBar';

const GRADES = ['Jun', 'Mid', 'Sen', 'Lead'];
const SHIFTS = ['-1', '', '+1'];
const COLS = GRADES.flatMap(g => SHIFTS.map(s => s ? `${g} ${s}` : g));

const LEVEL_COLORS = {
  1: '#4ade80', // dark green
  2: '#3b82f6', // dark blue
  3: '#8b5cf6'  // dark purple
};

export default function FlowMatrix() {
  const [departments, setDepartments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [targetGrade, setTargetGrade] = useState('Mid');
  const [targetLevel, setTargetLevel] = useState(2);
  const [userSkills, setUserSkills] = useState([]);
  const cellRefs = useRef({});
  const [lines, setLines] = useState([]);
  const cellWidth = 160;

  useEffect(() => {
    const stored = localStorage.getItem('requirementsDepartments');
    if (stored) {
      const parsed = JSON.parse(stored);
      setDepartments(parsed);
    }
    const savedSkills = localStorage.getItem('skills');
    if (savedSkills) {
      setUserSkills(JSON.parse(savedSkills));
    }
  }, []);

  useEffect(() => {
    const dept = departments[activeIndex];
    if (!dept) return;

    const skillMap = {};

    for (const row of dept.table || []) {
      const { skill, levels } = row;
      if (!skillMap[skill]) skillMap[skill] = {};
      for (const [colKey, lvl] of Object.entries(levels)) {
        const match = colKey.match(/^([A-Za-z]+)\s*([+-]1)?$/);
        if (match) {
          const base = match[1];
          const offset = match[2] ?? '';
          const formatted = offset ? `${base} ${offset}` : base;
          if (COLS.includes(formatted)) {
            skillMap[skill][formatted] = lvl;
          }
        }
      }
    }

    const sortedRows = Object.entries(skillMap)
      .filter(([_, data]) => Object.keys(data).length > 0)
      .map(([skill, data]) => ({ skill, data }));
    setRows(sortedRows);
  }, [departments, activeIndex]);

  useLayoutEffect(() => {
    const newLines = [];
    const fullTargetKey = targetLevel === 0 ? targetGrade : `${targetGrade} ${targetLevel}`;
    rows.forEach((row, rowIdx) => {
      let prevKey = null;
      COLS.forEach((col, colIdx) => {
        const lvl = row.data[col];
        const userLevel = userSkills.find(s => s.name === row.skill)?.level ?? 0;
        const isPending = lvl && userLevel < lvl;
        const key = `${row.skill}-${col}`;
        if (isPending && col === fullTargetKey) {
          const el = cellRefs.current[key];
          if (el && prevKey) {
            const prevEl = cellRefs.current[prevKey];
            if (prevEl) {
              const rect1 = prevEl.getBoundingClientRect();
              const rect2 = el.getBoundingClientRect();
              newLines.push({
                x1: rect1.left + cellWidth,
                y1: rect1.top + rect1.height / 2,
                x2: rect2.left,
                y2: rect2.top + rect2.height / 2
              });
            }
          }
        }
        if (isPending) {
          prevKey = key;
        }
      });
    });
    setLines(newLines);
  }, [rows, userSkills, targetGrade, targetLevel]);

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      <NavBar />
      <h2>📊 Поток компетенций</h2>

      <div style={{ marginBottom: 20, color: 'white' }}>
        <label style={{ marginRight: 10 }}>🎯 Цель:</label>
        <select value={targetGrade} onChange={e => setTargetGrade(e.target.value)}>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={targetLevel} onChange={e => setTargetLevel(Number(e.target.value))}>
          {[-1, 0, 1].map(lvl => <option key={lvl} value={lvl}>Уровень {lvl}</option>)}
        </select>
      </div>

      <div style={{ overflowX: 'auto', position: 'relative' }}>
        

        <table style={{ borderCollapse: 'separate', borderSpacing: '0 10px', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#333' }}>
              {COLS.map(col => (
                <th key={col} style={thStyle}>{col.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {COLS.map(col => {
                  const lvl = row.data[col];
                  const userLevel = userSkills.find(s => s.name === row.skill)?.level ?? 0;
                  const isCompleted = lvl && userLevel >= lvl;
                  const colIdx = COLS.indexOf(col);
const targetKey = targetLevel === 0 ? targetGrade : `${targetGrade} ${targetLevel > 0 ? '+' : ''}${targetLevel}`;
const targetIdx = COLS.indexOf(targetKey);
const isInTargetPath = lvl && colIdx <= targetIdx && userLevel < lvl;
                  const key = `${row.skill}-${col}`;

                  return (
                    <td
                      key={col}
                      ref={el => cellRefs.current[key] = el}
                      style={{
                        ...tdStyle,
                        backgroundColor: lvl ? LEVEL_COLORS[lvl] : 'transparent',
                        border: 'none',
                        borderRadius: lvl ? 8 : 0,
                        color: lvl ? '#000' : 'transparent',
                        opacity: isCompleted ? 1 : isInTargetPath ? 0.4 : 0,
outline: isCompleted ? '2px solid limegreen' : 'none'
                      }}
                    >
                      {lvl ? row.skill : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {[1, 2, 3].map(level => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 20, backgroundColor: LEVEL_COLORS[level], borderRadius: 4 }}></div>
              <span style={{ color: '#fff' }}>- {level} lvl</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: 8,
  backgroundColor: '#2a2a2a',
  color: '#fff',
  border: '1px solid #444',
  textAlign: 'center'
};

const tdStyle = {
  padding: 10,
  textAlign: 'center',
  minWidth: 160
};
