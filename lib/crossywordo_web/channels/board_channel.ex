defmodule CrossywordoWeb.BoardChannel do
  use Phoenix.Channel

  def join("join:empty", %{"name" => name}, socket) do
    {:ok, assign(socket, :name, name)}
  end

  def join("join:" <> _other_board, _params, _socket) do
    {:error, %{reason: "not_implemented"}}
  end

  #broadcast! calls handle_out for each client, in the event they
  #must be treated differently
  def handle_in("message_in", %{"contents" => body}, socket) do
     msg = socket.assigns[:name] <> ": " <> body
     broadcast! socket, "notice", %{contents: msg}
     {:noreply, socket}
  end
end
