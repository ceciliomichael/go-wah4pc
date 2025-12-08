import { CodeBlock } from "@/components/ui/code-block";

interface CodeExampleProps {
  title?: string;
  language: string;
  code: string;
}

export function CodeExample({ title, language, code }: CodeExampleProps) {
  return (
    <div>
      {title && <h4 className="font-medium text-slate-900 mb-2">{title}</h4>}
      <CodeBlock language={language} code={code} />
    </div>
  );
}

interface ResponseExampleProps {
  status: string;
  language?: string;
  code: string;
}

export function ResponseExample({
  status,
  language = "json",
  code,
}: ResponseExampleProps) {
  return (
    <div className="rounded-md bg-slate-50 p-4 text-sm border border-slate-200">
      <p className="font-semibold text-slate-700 mb-2">Response ({status}):</p>
      <CodeBlock language={language} code={code} />
    </div>
  );
}

interface TerminalBlockProps {
  title: string;
  description?: string;
  code: string;
}

export function TerminalBlock({ title, description, code }: TerminalBlockProps) {
  return (
    <div>
      <h3 className="font-medium text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 mb-2">{description}</p>
      )}
      <CodeBlock language="bash" code={code} />
    </div>
  );
}

interface PrerequisitesBoxProps {
  items: string[];
}

export function PrerequisitesBox({ items }: PrerequisitesBoxProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
      <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
        {items.map((item, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    </div>
  );
}

interface DataTypeExampleProps {
  title: string;
  description: string;
  code: string;
}

export function DataTypeExample({ title, description, code }: DataTypeExampleProps) {
  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      <p className="text-sm text-slate-600 mb-3">{description}</p>
      <CodeBlock language="json" code={code} />
    </div>
  );
}