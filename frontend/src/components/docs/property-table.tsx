import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PropertyField {
  name: string;
  type: string;
  required: boolean | "conditional";
  description: string;
}

interface PropertyTableProps {
  fields: PropertyField[];
  showRequired?: boolean;
}

export function PropertyTable({
  fields,
  showRequired = true,
}: PropertyTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Type</TableHead>
            {showRequired && <TableHead>Required</TableHead>}
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.name}>
              <TableCell className="font-mono text-sm">{field.name}</TableCell>
              <TableCell>{field.type}</TableCell>
              {showRequired && (
                <TableCell>
                  {field.required === true ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : field.required === "conditional" ? (
                    <span className="text-slate-400">Conditional</span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </TableCell>
              )}
              <TableCell>{field.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface SimpleTableRow {
  label: string;
  value: string;
  valueClassName?: string;
}

interface SimpleTableProps {
  rows: SimpleTableRow[];
}

export function SimpleTable({ rows }: SimpleTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-medium bg-slate-50 w-40">
                {row.label}
              </TableCell>
              <TableCell className={row.valueClassName}>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}