defmodule CrossywordoWeb.BoardChannel do
  use Phoenix.Channel

  @impl true
  def join(board_name, %{"name" => display_name}, socket) do
    IO.puts("got call for board " <> board_name)
    {:ok, _my_board_pid} = Crossywordo.Table.get_board(%{name: {:global, board_name}})
    {:ok, socket |> assign(:display_name, display_name)}
  end

  @impl true
  def handle_info(term, socket) do
    broadcast!(socket, "notice", %{contents: term})
    {:noreply, socket}
  end

  #broadcast! calls handle_out for each client, in the event they
  #must be treated differently
  @impl true
  def handle_in("call_in", %{"call" => call}, socket) do
     GenServer.call({:global, socket.topic}, call |> String.split(" "))
     {:noreply, socket}
  end
end
