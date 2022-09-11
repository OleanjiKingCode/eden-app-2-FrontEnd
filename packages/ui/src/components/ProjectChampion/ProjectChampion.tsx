import "./style.css";

import { Members } from "@graphql/eden/generated";
import { Avatar } from "ui";

export interface IProjectChampion {
  member: Members;
}

export const ProjectChampion = ({ member }: IProjectChampion) => {
  return (
    <div>
      <p className="pc-text-head ">🏆 Champion</p>

      <div className="mt-2 flex items-center">
        <Avatar src={member?.discordAvatar || ""} />
        <p className="pc-text ml-4">@{member?.discordName}</p>
      </div>
    </div>
  );
};
