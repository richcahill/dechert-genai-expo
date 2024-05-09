import { Lightbulb } from "lucide-react";

type SideBarProps = {
  name: string;
  description: string;
  number: number;
  questions: string[];
  tip?: string;
};

const SideBar = ({
  name,
  description,
  number,
  questions,
  tip,
}: SideBarProps) => {
  return (
    <div className="h-full bg-white border rounded-md flex flex-col justify-between p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xl opacity-25">#{number}</p>
        <h2 className="font-medium text-4xl">{name}</h2>
        <p>{description}</p>
        <ul className="mt-4 space-y-2">
          {questions.map((question, i) => (
            <li key={i} className="opacity-50 italic">
              {question}
            </li>
          ))}
        </ul>
      </div>
      {tip && (
        <div className="bg-zinc-50 border-zinc-200 border p-4 flex flex-col gap-2 rounded">
          <div className="flex justify-start gap-2">
            <h3 className="font-medium text-xl">Tip</h3>
            <Lightbulb />
          </div>
          <p className="text-lg">{tip}</p>
        </div>
      )}
    </div>
  );
};

export default SideBar;
