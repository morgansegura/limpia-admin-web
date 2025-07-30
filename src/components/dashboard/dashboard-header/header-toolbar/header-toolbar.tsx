import { ReactNode } from "react";

import "./header-toolbar.css";

type THeaderToolbarProps = {
  children: ReactNode;
};

export function HeaderToolbar({ children }: THeaderToolbarProps) {
  return <div className="header-toolbar">{children}</div>;
}
