defmodule CrossywordoWeb.BoardChannel do
  use Phoenix.Channel

  @impl true
  def join(board_name, %{"name" => display_name}, socket) do
    {:ok, my_board_pid} = Crossywordo.Table.get_board(%{name: {:global, board_name}})
    {:ok, socket |> assign(:display_name, display_name)}
  end

  #TODO implement this properly
  @impl true
  def handle_info(_term, socket) do
    {:noreply, socket}
  end

  #broadcast! calls handle_out for each client, in the event they
  #must be treated differently
  @impl true
  def handle_in("call_in", %{"call" => call}, socket) do
     msg = GenServer.call({:global, socket.topic}, String.to_atom call)
     broadcast! socket, "notice", %{contents: call <> ": " <> msg}
     {:noreply, socket}
  end
end
