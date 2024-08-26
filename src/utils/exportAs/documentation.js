import { dbToTypes } from "../../data/datatypes";
import { jsonToMermaid } from "./mermaid";
import { databases } from "../../data/databases";

export function jsonToDocumentation(obj) {

  const documentationSummary = obj.tables
    .map((table) => {
      return `\t- [${table.name}](#${table.name})`;
    }).join("\n");

  const documentationEntities = obj.tables
    .map((table) => {
      const fields = table.fields
        .map((field) => {
          const fieldType =
            field.type +
            ((dbToTypes[obj.database][field.type].isSized ||
              dbToTypes[obj.database][field.type].hasPrecision) &&
            field.size &&
            field.size !== ""
              ? "(" + field.size + ")"
              : "");
          return `| **${field.name}** | ${fieldType} | ${field.primary ? "🔑 PK, " : ""}` +
            `${field.nullable ? "null " : "not null "}${field.unique ? ", unique" : ""}${field.increment?", autoincrement":""}` +
            `${field.default ? `, default: ${field.default}` : ""} | ` +
            `${relationshipByField(table.id, obj.relationships, field.id)}` +
            ` |${field.comment ? field.comment : ""} |`;

        }).join("\n");
      return `### ${table.name}\n${table.comment ? table.comment : ""}\n\n` +
        `| Name        | Type          | Settings                      | References                    | Note                           |\n` +
        `|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|\n` +
        `${fields}\n\n`;
    }).join("");
  
  function relationshipByField(table, relationships, fieldId) {
    return relationships.filter(r => r.startTableId === table && r.startFieldId === fieldId)
              .map((rel) => rel.name);

  }
  
  const documentationRelationships = obj.relationships?.length
    ? obj.relationships
      .map((r) => {
        const startTable = obj.tables[r.startTableId].name;
        const endTable = obj.tables[r.endTableId].name;
        return `- **${startTable} to ${endTable}**: ${r.cardinality}\n`;
      }).join("") : "";
  
  return `# ${obj.title} documentation\n## Summary\n\n- [Introduction](#introduction)\n- [Database Type](#database-type)\n`+
          `- [Table Structure](#table-structure)\n${documentationSummary}\n- [Relationships](#relationships)\n- [Database Diagram](#database-Diagram)\n\n`+
          `## Introduction\n\n## Database type\n\n- **Database system:** `+
    `${databases[obj.database].name}\n## Table structure\n\n${documentationEntities}`+
          `\n\n## Relationships\n\n${documentationRelationships}\n\n`+
          `## Database Diagram\n\n\`\`\`${jsonToMermaid(obj)}\`\`\``;
}