defmodule CrossywordoWeb.BoardChannel do
  use Phoenix.Channel

  @impl true
  def join(board_name, %{"name" => display_name}, socket) do
    IO.puts("got call for board " <> board_name)
    {:ok, my_board_pid} = Crossywordo.Table.get_board(%{name: {:global, board_name}})
    called = GenServer.call(my_board_pid, :link)
    {:ok, socket |> assign(:display_name, display_name)}
  end

  @impl true
  def handle_info(term, socket) do
    IO.puts("message \"" <> term <> "\" received")
    broadcast!(socket, "notice", %{contents: term})
    {:noreply, socket}
  end

  #broadcast! calls handle_out for each client, in the event they
  #must be treated differently
  @impl true
  def handle_in("call_in", %{"call" => call}, socket) do
     GenServer.call({:global, socket.topic}, String.to_atom call)
     {:noreply, socket}
  end
end
