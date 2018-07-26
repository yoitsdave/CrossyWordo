defmodule Crossywordo.Board do
  use GenServer

  def start_link(%{:name => board_name} = args) do
    GenServer.start_link(__MODULE__, args, name: board_name)
  end

  # start_board.board tuples are mostly for internal access,
  # but they are maps with values
  # "current", "ans", "across_num", "down_num", "label", "circled"

  # filled blocks have the following predefined values:
  # {"current": ".", ans": ".", "across_num": null, "down_num": null,
  #  "label": -1, "circled": false}

  # also note - board is a tuple to facilitate easy access and due to
  # its fixed size

  defp atomize_keys(map) do
    Map.new(map, fn {key, value} ->
                   {String.to_atom(key), value}
                 end)
  end

  @impl true
  def init(%{:name => board_name} = _args) do
    IO.puts "room " <> inspect(board_name) <> " has been started"

    {:ok, body} = File.read("assets/vendor/example.json")
    current_board = Poison.decode!(body) |>
                    atomize_keys() |>
                    Map.update!(:board, fn state ->
                                         Enum.map(state, &atomize_keys(&1)) |>
                                         List.to_tuple
                                        end) |>
                    Map.put(:current, " ") |>
                    Map.put(:channel, :none)
    {:ok, current_board}
  end

  @impl true
  def handle_call(call_type, from, board) do
    case call_type do
      #:check -> check(from, board)
      #:get_clues -> get_clues(from, board)
      #:get_state -> get_state(from, board)
      #:kill -> kill(from, board)
      #:reveal -> reveal(from, board)
      :say_hi -> say_hi(from, board)
      #:set_letter -> set_letter(from, board)
      :link -> link(from, board)
    end
  end

  #TODO implement this properly
  def link({from_pid, _term}, board) do
    {:reply, "Linked", Map.update!(board, :channel, fn _current -> from_pid end)}
  end

  def say_hi({from_pid, _term}, board) do
    send(from_pid, "hello there!")
    {:reply, "Said hi!", board}
  end
end
