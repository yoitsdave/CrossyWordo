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

  @impl true
  def init(%{:name => board_name} = _args) do
    IO.puts "room " <> inspect(board_name) <> " has been started"

    {:ok, body} = File.read("lib/crossywordo/puzpy/example.json")
    current_board = Poison.decode!(body) |>
                    Map.update!("board", fn state ->
                                           state |>
                                           Enum.map(fn square ->
                                                      [" "] ++ square
                                                    end) |>
                                           List.to_tuple
                                         end)

    {:ok, current_board}
  end

  @impl true
  def handle_call([call_type | rest], from, board) do
    case call_type do
      #"check" -> check(from, board)
      #"get_clues" -> get_clues(rest, from, board)
      #"get_state" -> get_state(rest, from, board)
      #"kill" -> kill(rest, from, board)
      #"reveal" -> reveal(rest, from, board)
      "say_hi" -> say_hi(rest, from, board)
      #"set_letter" -> set_letter(rest, from, board)
    end
  end

  def say_hi(_rest, {from_pid, _term}, board) do
    send(from_pid, "hello there!")
    {:reply, :ok, board}
  end
end
