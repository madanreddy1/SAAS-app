import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock("../api/api", () => ({
  default: {
    post: (...args) => mockPost(...args),
    get: (...args) => mockGet(...args),
    interceptors: { request: { use: vi.fn() } },
  },
}));

describe("🧪 TEST FLOW: Login → token → Dashboard projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("logs in, saves token to localStorage, then dashboard loads projects", async () => {
    const user = userEvent.setup();

    mockPost.mockResolvedValue({
      data: { access_token: "mock-access-token", token_type: "bearer" },
    });
    mockGet.mockResolvedValue({
      data: [
        { id: 1, title: "Project One", description: "First project" },
        { id: 2, title: "Project Two", description: "Second project" },
      ],
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    );

    await user.type(screen.getByTestId("login-email"), "user@example.com");
    await user.type(screen.getByTestId("login-password"), "password123");
    await user.click(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("mock-access-token");
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /your projects/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/projects/");
    });

    expect(screen.getByText("Project One")).toBeInTheDocument();
    expect(screen.getByText("Project Two")).toBeInTheDocument();
  });
});
