import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TwoFactorSetupForm from "@/components/auth/TwoFactorSetupForm";

const mockSetup2FA = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();
const testProvisioningUri = "otpauth://totp/Jiki:test@example.com?secret=ABC123&issuer=Jiki";

jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    setup2FA: mockSetup2FA
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
    render(
      <TwoFactorSetupForm
        provisioningUri={testProvisioningUri}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText("Set Up Two-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText(/scan the qr code/i)).toBeInTheDocument();
  });

  test("renders QR code with provisioning URI", () => {
    render(
      <TwoFactorSetupForm
        provisioningUri={testProvisioningUri}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute("data-value", testProvisioningUri);
  });

  test("renders OTP input and setup button", () => {
    render(
      <TwoFactorSetupForm
        provisioningUri={testProvisioningUri}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expect(screen.getByRole("button", { name: /complete setup/i })).toBeInTheDocument();
  });

  test("setup button is disabled when code is incomplete", () => {
    render(
      <TwoFactorSetupForm
        provisioningUri={testProvisioningUri}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const setupButton = screen.getByRole("button", { name: /complete setup/i });
    expect(setupButton).toBeDisabled();
  });

  test("calls setup2FA and onSuccess on success", async () => {
    mockSetup2FA.mockResolvedValueOnce(undefined);
    render(
      <TwoFactorSetupForm
        provisioningUri={testProvisioningUri}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

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
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test("displays error message on setup failure", async () => {
    mockSetup2FA.mockRejectedValueOnce(new Error("Invalid code"));
    render(
      <TwoFactorSetupForm
        provisioningUri={testProvisioningUri}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

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

  test("cancel button calls onCancel", () => {
    render(
      <TwoFactorSetupForm
        provisioningUri={testProvisioningUri}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
