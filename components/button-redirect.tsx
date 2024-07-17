"use client"

import { Link2 } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';

interface ClientButtonProps {
  url: string;
  buttonLabel: string;
}

const ClientButton: React.FC<ClientButtonProps> = ({ url, buttonLabel }) => {
  return (
    <Button
      type="submit"
      className="max-w-sm m-auto bg-muted/40 text-primary border hover:bg-black/20 border-black/20 backdrop-blur-xl"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        window.open(url, "_blank");
      }}
    >
      <Link2 className="h-5 w-5" aria-hidden="true" /> &nbsp;
      {buttonLabel}
    </Button>
  );
}

export default ClientButton;
