import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import OTPInput from "@/components/auth/OTPInput";

describe("OTPInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders 6 input boxes", () => {
    render(<OTPInput value="" onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);
  });

  test("only accepts numeric input", () => {
    render(<OTPInput value="" onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "a" } });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test("accepts digit input and calls onChange", () => {
    render(<OTPInput value="" onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "1" } });

    expect(mockOnChange).toHaveBeenCalledWith("1");
  });

  test("displays current value in inputs", () => {
    render(<OTPInput value="123456" onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("1");
    expect(inputs[1]).toHaveValue("2");
    expect(inputs[2]).toHaveValue("3");
    expect(inputs[3]).toHaveValue("4");
    expect(inputs[4]).toHaveValue("5");
    expect(inputs[5]).toHaveValue("6");
  });

  test("handles paste of full 6-digit code", () => {
    render(<OTPInput value="" onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => "123456" }
    });

    expect(mockOnChange).toHaveBeenCalledWith("123456");
  });

  test("strips non-numeric characters from pasted content", () => {
    render(<OTPInput value="" onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => "12-34-56" }
    });

    expect(mockOnChange).toHaveBeenCalledWith("123456");
  });

  test("disables all inputs when disabled prop is true", () => {
    render(<OTPInput value="" onChange={mockOnChange} disabled />);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
