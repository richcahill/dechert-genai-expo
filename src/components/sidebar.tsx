import { Lightbulb, Pizza } from "lucide-react";

type SideBarProps = {
  name: string;
  title: string;
  description: string[];
  number: number;
  questions?: string[];
  tip?: string;
  thought?: string;
};

const SideBar = ({
  name,
  title,
  description,
  number,
  questions,
  tip,
  thought,
}: SideBarProps) => {
  return (
    <div className="h-full bg-white border rounded-md flex flex-col justify-between p-6">
      <div className="flex flex-col gap-4">
        <p className="text-xl opacity-25">#{number}</p>
        <h2 className="font-medium text-4xl">{name}</h2>
        <div className="space-y-2">
          {description.map((desc, i) => (
            <p key={i}>{desc}</p>
          ))}
        </div>
        {thought && (
          <div className="bg-zinc-100 border-zinc-300 border p-4 flex flex-col gap-2 rounded">
            <div className="flex justify-start gap-2">
              <h3 className="font-medium text-xl">Food For Thought</h3>
              <Pizza />
            </div>
            <p className="text-lg">{thought}</p>
          </div>
        )}
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
