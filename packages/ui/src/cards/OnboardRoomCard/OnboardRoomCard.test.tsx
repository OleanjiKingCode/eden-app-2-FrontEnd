import { getRoomTypeMock } from "@eden/package-mock";
import { render } from "@testing-library/react";

import { OnboardRoomCard } from "./OnboardRoomCard";

describe("OnboardRoomCard", () => {
  it("renders without throwing", () => {
    const { container } = render(<OnboardRoomCard room={getRoomTypeMock()} />);

    expect(container).toBeInTheDocument();
  });
});
