defmodule CrossywordoWeb.BoardChannel do
  use Phoenix.Channel

  @impl true
  def join(board_name, %{"name" => display_name}, socket) do
    IO.puts("got call for board " <> board_name)
    {:ok, _my_board_pid} = Crossywordo.Board.start_link(%{name: {:global, board_name}})
    {:ok, socket |> assign(:display_name, display_name)}
  end

  @impl true
  def terminate(_message, socket) do
    GenServer.stop({:global, socket.topic}, :empty)
  end

  @impl true
  def handle_info(received, socket) do
    [type | contents] = String.split(received, ":")
    broadcast!(socket, type, %{contents: contents})
    broadcast!(socket, "notice", %{contents: received})
    {:noreply, socket}
  end

  #broadcast! calls handle_out for each client, in the event they
  #must be treated differently
  @impl true
  def handle_in("call_in", %{"call" => call}, socket) do
     GenServer.call({:global, socket.topic}, call |> String.split("|"))
     {:noreply, socket}
  end
end
