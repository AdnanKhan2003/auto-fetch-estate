import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

function TooltipWrapper({
  children,
  content,
  side = "top",
  align = "center",
}: TooltipWrapperProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-pointer inline-flex items-center">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export default TooltipWrapper;
