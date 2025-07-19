import React from "react";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="w-screen h-screen flex flex-col gap-5 justify-center items-center">
      <div className="text-3xl font-bold">This is a button</div>
      <Button>Click me!</Button>
    </div>
  );
}

export default App;
