defmodule CrossywordoWeb.BoardChannel do
  use Phoenix.Channel

  def join("join:empty", msg, socket) do
    IO.puts inspect msg
    {:ok, socket}
  end

  def join("join:" <> _other_board, _params, _socket) do
    {:error, %{reason: "not_implemented"}}
  end

  #broadcast! calls handle_out for each client, in the event they
  #must be treated differently
  def handle_in("message_in", %{"contents" => body}, socket) do
     broadcast! socket, "notice", %{contents: body}
     {:received, socket}
  end
end
