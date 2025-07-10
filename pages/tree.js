import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import NavBar from '../components/NavBar';

const levelColors = ['#e5e7eb', '#86efac', '#60a5fa', '#a78bfa'];
const GRADES = ['Jun', 'Mid', 'Sen', 'Lead'];

export default function SkillTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [skills, setSkills] = useState({});
  const [gradeLevels, setGradeLevels] = useState({});
  const [requirements, setRequirements] = useState([]);
  const [optionalGroups, setOptionalGroups] = useState([]);
  const [optionalTargets, setOptionalTargets] = useState([]);

  const [targetGrade, setTargetGrade] = useState('Jun');
  const [targetLevel, setTargetLevel] = useState(0);
  const [targetChecklist, setTargetChecklist] = useState([]);

  // Загружаем цель из localStorage
  useEffect(() => {
    const savedGrade = localStorage.getItem('currentTargetGrade');
    const savedLevel = localStorage.getItem('currentTargetLevel');
    if (savedGrade) setTargetGrade(savedGrade);
    if (!isNaN(parseInt(savedLevel))) setTargetLevel(parseInt(savedLevel));
  }, []);

  useEffect(() => {
    const reqRaw = localStorage.getItem('requirements');
    const skRaw = localStorage.getItem('skills');
    const optGroupsRaw = localStorage.getItem('optionalGroups');
    const optTargetsRaw = localStorage.getItem('optionalTargets');

    if (!reqRaw || !skRaw) return;

    const reqs = JSON.parse(reqRaw);
    const skillList = JSON.parse(skRaw);
    const groups = optGroupsRaw ? JSON.parse(optGroupsRaw) : [];
    const targets = optTargetsRaw ? JSON.parse(optTargetsRaw) : [];

    const skillMap = {};
    skillList.forEach((s) => {
      skillMap[s.name] = s.level;
    });

    const gradeMap = {};
    GRADES.forEach((g) => (gradeMap[g] = 0));

    const canReach = (grade, level) => {
      const reqConds = reqs.filter((r) => r.grade === grade && r.level === level);
      const optGroupItems = groups.flatMap((group) =>
        group.items.filter((item) => item.grade === grade && item.level === level)
      );
      const optTarget = targets.find((t) => t.grade === grade && t.level === level)?.count || 0;

      const allRequiredOk = reqConds.every((r) => {
        if (r.type === 'skill') {
          return (skillMap[r.skill] || 0) >= r.required;
        } else if (r.type === 'grade') {
          return (gradeMap[r.skill] || 0) >= r.required;
        }
        return false;
      });

      const passedOptionalCount = optGroupItems.filter((item) => {
        return (skillMap[item.skill] || 0) >= item.required;
      }).length;

      return allRequiredOk && passedOptionalCount >= optTarget;
    };

    GRADES.forEach((grade) => {
      for (let lvl = 0; lvl <= 3; lvl++) {
        if (canReach(grade, lvl)) {
          gradeMap[grade] = lvl;
        } else {
          break;
        }
      }
    });

    setSkills(skillMap);
    setGradeLevels(gradeMap);
    setRequirements(reqs);
    setOptionalGroups(groups);
    setOptionalTargets(targets);

    // Построение узлов
    const nodesOut = [];

    GRADES.forEach((grade, i) => {
      const lvl = gradeMap[grade];

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
      );

      nodesOut.push({
        id: grade,
        data: { label: bar },
        position: { x: 520, y: i * 150 },
        style: {
          backgroundColor: '#111',
          borderRadius: 6,
          padding: 6,
          width: 90,
          textAlign: 'center',
          color: '#fff',
        },
      });
    });

    // Навыки
    const requiredSkills = reqs.map((r) => r.skill).filter((s) => !GRADES.includes(s));
    const optionalSkills = groups.flatMap((g) => g.items.map((i) => i.skill));
    const skillNames = [...new Set([...requiredSkills, ...optionalSkills])];

    const skillNodeSpacingX = 200; // расстояние от центра
    const skillNodeSpacingY = 100;
    const centerX = 500;

	skillNames.forEach((s, index) => {
  const isOptional = optionalSkills.includes(s);
  const row = Math.floor(index / 2);          // каждые 2 навыка — новая строка
  const isLeft = index % 2 === 0;             // чередуем стороны

  const posX = isLeft ? centerX - skillNodeSpacingX : centerX + skillNodeSpacingX;
  const posY = -50 + row * skillNodeSpacingY;

  nodesOut.push({
    id: `skill-${s}`,
    data: { label: isOptional ? `🌟 ${s}` : s },
    position: { x: posX, y: posY },
    style: {
      backgroundColor: levelColors[skillMap[s] || 0],
      padding: 8,
      borderRadius: 6,
      border: isOptional ? '2px dashed #60a5fa' : '1px solid #333',
      color: isOptional ? '#a5b4fc' : '#000',
      fontWeight: 500,
    },
  });
});

    // Стрелки ТОЛЬКО от обязательных требований
    const edgesOut = [];

    reqs.forEach((r, i) => {
      const source = GRADES.includes(r.skill) ? r.skill : `skill-${r.skill}`;
      edgesOut.push({
        id: `req-${i}`,
        source,
        target: r.grade,
        animated: true,
        style: { stroke: levelColors[r.required] }
      });
    });

    setNodes(nodesOut);
    setEdges(edgesOut);
  }, []);

  useEffect(() => {
    if (!requirements.length || !skills) return;

    const collected = [];

    const collectRequirements = (grade, level) => {
      if (level < 0) return;

      const alreadyReached = (gradeLevels[grade] || 0) >= level;
      const skipThis = alreadyReached;

      if (!skipThis) {
        const reqs = requirements.filter((r) => r.grade === grade && r.level === level);
        const optItems = optionalGroups
          .flatMap((g) => g.items)
          .filter((item) => item.grade === grade && item.level === level);

        const optTarget = optionalTargets.find((t) => t.grade === grade && t.level === level)?.count || 0;

        reqs.forEach((r) => {
          const actual = r.type === 'skill'
            ? (skills[r.skill] || 0)
            : (gradeLevels[r.skill] || 0);

          const ok = actual >= r.required;
          collected.push({ ...r, actual, ok });

          if (!ok && r.type === 'grade') {
            collectRequirements(r.skill, r.required);
          }
        });

        const passedOptional = optItems.filter((i) => (skills[i.skill] || 0) >= i.required);
        const missingOptional = optItems.filter((i) => (skills[i.skill] || 0) < i.required);

        if (passedOptional.length < optTarget) {
          missingOptional.forEach((i) => {
            collected.push({
              ...i,
              type: 'optional',
              actual: skills[i.skill] || 0,
              ok: false
            });
          });
        }
      }

      collectRequirements(grade, level - 1);
    };

    collectRequirements(targetGrade, targetLevel);
    setTargetChecklist(collected);

    const edgesOut = collected
      .filter((item) => !item.ok)
      .map((item, i) => {
        const source = GRADES.includes(item.skill)
          ? item.skill
          : `skill-${item.skill}`;
        return {
          id: `missing-${i}`,
          source,
          target: item.grade,
          animated: true,
          style: { stroke: levelColors[item.required] }
        };
      });

    setEdges(edgesOut);
  }, [targetGrade, targetLevel, requirements, skills, gradeLevels, optionalGroups, optionalTargets]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <NavBar />
      <div style={{ padding: 10, backgroundColor: '#111', color: '#fff' }}>
        🎯 Цель:
        <select
          value={targetGrade}
          onChange={(e) => {
            setTargetGrade(e.target.value);
            localStorage.setItem('currentTargetGrade', e.target.value);
          }}
          style={{ marginLeft: 10, marginRight: 10 }}
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={targetLevel}
          onChange={(e) => {
            const lvl = parseInt(e.target.value);
            setTargetLevel(lvl);
            localStorage.setItem('currentTargetLevel', lvl);
          }}
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
          <h4>🔍 Требования для {targetGrade} {targetLevel} и ниже</h4>
          <ul>
            {targetChecklist.map((item, i) => (
              <li key={i} style={{ color: item.ok ? '#86efac' : '#f87171' }}>
                {item.type === 'skill' || item.type === 'optional'
                  ? 'Навык'
                  : 'Грейд'} <b>{item.skill}</b>: нужно ≥ {item.required}, сейчас {item.actual}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
