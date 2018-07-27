defmodule Crossywordo.Board do
  use GenServer

  def start_link(%{:name => board_name} = args) do
    GenServer.start_link(__MODULE__, args, name: board_name)
  end

  defp clean(any) do
    inspect(any,  limit: :infinity)
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
    IO.puts "room " <> clean(board_name) <> " has been started"

    {:ok, body} = File.read("lib/crossywordo/puzpy/example.json")
    current = Poison.decode!(body) |>
              Map.update!("board", fn state ->
                                     state |>
                                     Enum.map(fn square ->
                                                Map.put(square,
                                                "current",
                                                case Map.get(square, "ans") do
                                                  "." -> "."
                                                  _other -> " "
                                                end)
                                              end) |>
                                     List.to_tuple
                                   end)
    {:ok, current}
  end

  @impl true
  def terminate(reason, _board) do
    IO.puts reason
  end

  @impl true
  def handle_call([call_type | rest], from, board) do
    case call_type do
      "get_clues" -> get_clues(rest, from, board)
      "get_states" -> get_states(rest, from, board)
      "say_hi" -> say_hi(rest, from, board)
      #"set_letter" -> set_letter(rest, from, board)

      other -> failed_call([other | rest], from, board)
    end
  end

  def get_clues(_rest, {from_pid, _term}, board) do
    clues = [Map.get(board, "across_clues"), Map.get(board, "down_clues")]
    send(from_pid, "clues:" <> clean clues)
    {:reply, :ok, board}
  end

  def get_states(_rest, {from_pid, _term}, board) do
    vals = 0..Map.get(board, "width")*Map.get(board, "height")-1 |>
           Enum.map(fn square_num ->
                      Map.get(board, "board") |>
                      elem(square_num)
                    end)
    IO.puts(clean vals)
    send(from_pid, "states:" <> Poison.encode!(vals))
    {:reply, :ok, board}
  end

  def say_hi(_rest, {from_pid, _term}, board) do
    send(from_pid, "greetings:hello there!")
    {:reply, :ok, board}
  end

  def failed_call(call_data, {from_pid, _term}, board) do
    send(from_pid, "fail:call to " <> clean(call_data) <> " failed")
    {:reply, :fail, board}
  end
end
