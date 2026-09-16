import fs from 'node:fs';
import { loadObject } from '/Users/systemsystems/.codex/worktrees/s203/OODS-Forge/packages/mcp-server/dist/objects/object-loader.js';

const rows = JSON.parse(fs.readFileSync('/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/a1e0c282-eb9d-458d-9f0e-3aa3be516fb4/scratchpad/cmos-missions.json', 'utf8'));
const cmos = rows[0];
const mission = loadObject('Mission');
const schema = mission.schema;

// The mapping a reuse would have to make: CMOS column -> research/Mission field.
const MAP = { id: 'mission_id', name: 'title', objective: 'objective', success_criteria: 'success_criteria', context: 'context', deliverables: 'deliverables', status: 'status', created_at: 'created_at', started_at: 'started_at', completed_at: 'completed_at', updated_at: 'updated_at', project_id: 'project_id', sprint_id: null, notes: null, reference_docs: null };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const blockers = [], mapped = [], unmapped = [];
for (const [column, field] of Object.entries(MAP)) {
  if (!field) { unmapped.push(column); continue; }
  const def = schema[field];
  if (!def) { unmapped.push(`${column} (no field ${field})`); continue; }
  const value = cmos[column];
  mapped.push(`${column} -> ${field}`);
  if (def.validation?.enum && value != null && !def.validation.enum.includes(value)) blockers.push({ field, why: `CMOS value ${JSON.stringify(value)} is outside the declared enum [${def.validation.enum.join(', ')}]` });
  if (def.type === 'uuid' && value != null && !uuid.test(String(value))) blockers.push({ field, why: `CMOS value ${JSON.stringify(value)} is not a uuid, and the field declares type uuid${def.validation?.format ? ` with format ${def.validation.format}` : ''}` });
  if (def.required && (value == null || value === '')) blockers.push({ field, why: `required by the object, absent on this CMOS row` });
}
// Required fields of research/Mission that CMOS has no column for at all.
const cmosColumns = new Set(Object.keys(MAP));
const mappedFields = new Set(Object.values(MAP).filter(Boolean));
const unfillable = Object.entries(schema).filter(([name, def]) => def.required && !mappedFields.has(name)).map(([name, def]) => `${name} (${def.type})`);
const foreign = Object.keys(schema).filter(name => !mappedFields.has(name));

console.log(JSON.stringify({
  cmosMission: cmos.id,
  researchMissionFieldCount: Object.keys(schema).length,
  cmosColumnsMapped: mapped.length,
  cmosColumnsWithNoHome: unmapped,
  blockers,
  requiredFieldsCmosCannotFill: unfillable,
  fieldsOnTheScreenThatAreNotCmosAtAll: foreign.length,
  foreignSample: foreign.slice(0, 14),
}, null, 2));
