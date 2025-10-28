import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LocaleStatusBadge from "@/app/dashboard/email-templates/components/LocaleStatusBadge";

describe("LocaleStatusBadge", () => {
  test("renders badge with correct locale text", () => {
    render(<LocaleStatusBadge locale="en" status="implemented" />);

    expect(screen.getByText("en")).toBeInTheDocument();
  });

  test("applies correct styles for implemented status", () => {
    render(<LocaleStatusBadge locale="en" status="implemented" />);

    const badge = screen.getByText("en");
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
  });

  test("applies correct styles for missing status", () => {
    render(<LocaleStatusBadge locale="fr" status="missing" />);

    const badge = screen.getByText("fr");
    expect(badge).toHaveClass("bg-red-100", "text-red-800");
  });

  test("applies correct styles for wip status", () => {
    render(<LocaleStatusBadge locale="es" status="wip" />);

    const badge = screen.getByText("es");
    expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
  });

  test("shows tooltip on hover", () => {
    render(<LocaleStatusBadge locale="en" status="implemented" templateType="welcome" templateSlug="user-signup" />);

    const badge = screen.getByText("en");

    // Initially no tooltip
    expect(screen.queryByText("en - Implemented")).not.toBeInTheDocument();

    // Hover to show tooltip
    fireEvent.mouseEnter(badge);
    expect(screen.getByText("en - Implemented")).toBeInTheDocument();
    expect(screen.getByText("This locale has been fully implemented and is ready to use")).toBeInTheDocument();
    expect(screen.getByText("Template: welcome/user-signup")).toBeInTheDocument();

    // Mouse leave to hide tooltip
    fireEvent.mouseLeave(badge);
    expect(screen.queryByText("en - Implemented")).not.toBeInTheDocument();
  });

  test("shows correct tooltip content for missing status", () => {
    render(<LocaleStatusBadge locale="fr" status="missing" />);

    const badge = screen.getByText("fr");
    fireEvent.mouseEnter(badge);

    expect(screen.getByText("fr - Missing")).toBeInTheDocument();
    expect(screen.getByText("This locale is supported but not yet implemented for this template")).toBeInTheDocument();
  });

  test("shows correct tooltip content for wip status", () => {
    render(<LocaleStatusBadge locale="es" status="wip" />);

    const badge = screen.getByText("es");
    fireEvent.mouseEnter(badge);

    expect(screen.getByText("es - Work in Progress")).toBeInTheDocument();
    expect(screen.getByText("This locale is currently being worked on and may not be fully ready")).toBeInTheDocument();
  });

  test("tooltip does not show template info when not provided", () => {
    render(<LocaleStatusBadge locale="en" status="implemented" />);

    const badge = screen.getByText("en");
    fireEvent.mouseEnter(badge);

    expect(screen.getByText("en - Implemented")).toBeInTheDocument();
    expect(screen.queryByText(/Template:/)).not.toBeInTheDocument();
  });
});
