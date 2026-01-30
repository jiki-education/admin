import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TwoFactorSetupForm from "@/app/setup-2fa/components/TwoFactorSetupForm";

const mockPush = jest.fn();
const mockSetup2FA = jest.fn();
const mockClear2FAState = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    setup2FA: mockSetup2FA,
    provisioningUri: "otpauth://totp/Jiki:test@example.com?secret=ABC123&issuer=Jiki",
    clear2FAState: mockClear2FAState
  })
}));

jest.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => <div data-testid="qr-code" data-value={value} />
}));

describe("TwoFactorSetupForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders heading and description", () => {
    render(<TwoFactorSetupForm />);

    expect(screen.getByText("Set Up Two-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText(/scan the qr code/i)).toBeInTheDocument();
  });

  test("renders QR code with provisioning URI", () => {
    render(<TwoFactorSetupForm />);

    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute("data-value", "otpauth://totp/Jiki:test@example.com?secret=ABC123&issuer=Jiki");
  });

  test("renders OTP input and setup button", () => {
    render(<TwoFactorSetupForm />);

    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expect(screen.getByRole("button", { name: /complete setup/i })).toBeInTheDocument();
  });

  test("setup button is disabled when code is incomplete", () => {
    render(<TwoFactorSetupForm />);

    const setupButton = screen.getByRole("button", { name: /complete setup/i });
    expect(setupButton).toBeDisabled();
  });

  test("calls setup2FA and redirects on success", async () => {
    mockSetup2FA.mockResolvedValueOnce(undefined);
    render(<TwoFactorSetupForm />);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: String(i + 1) } });
    });

    const setupButton = screen.getByRole("button", { name: /complete setup/i });
    fireEvent.click(setupButton);

    await waitFor(() => {
      expect(mockSetup2FA).toHaveBeenCalledWith("123456");
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("displays error message on setup failure", async () => {
    mockSetup2FA.mockRejectedValueOnce(new Error("Invalid code"));
    render(<TwoFactorSetupForm />);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: String(i + 1) } });
    });

    const setupButton = screen.getByRole("button", { name: /complete setup/i });
    fireEvent.click(setupButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid code")).toBeInTheDocument();
    });
  });

  test("cancel button clears state and redirects to signin", () => {
    render(<TwoFactorSetupForm />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockClear2FAState).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/signin");
  });
});
