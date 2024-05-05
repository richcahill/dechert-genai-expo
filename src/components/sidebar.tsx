type SideBarProps = {
  name: string;
  description: string;
  number: number;
  questions: string[];
};

const SideBar = ({ name, description, number, questions }: SideBarProps) => {
  return (
    <div className="h-full bg-white border rounded-md flex flex-col p-8">
      <p className="text-xl opacity-25">#{number}</p>
      <h2 className="font-medium text-4xl">{name}</h2>
      <p>{description}</p>
      <ul>
        {questions.map((question, i) => (
          <li key={i}>{question}</li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;
