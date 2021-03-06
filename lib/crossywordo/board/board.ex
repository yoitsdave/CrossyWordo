defmodule Crossywordo.Board do
  use GenServer

  def start_link(%{:name => board_name} = args) do
    case GenServer.start_link(__MODULE__, args, name: board_name) do
      {:ok, pid} -> {:ok, pid}
      {:error, {:already_started, pid}} -> {:ok, pid}
    end
  end

  defp clean(any) do
    inspect(any,  limit: :infinity)
  end

  # start_board.board tuples are maps with values
  # "current", "ans", "across_num", "down_num", "label", "circled", "checked"

  # to save memory, this is tagged as follows:
  # "c", "n", "a", "d", "l", "s", "h"

  # filled blocks have the following predefined values:
  # {"current": ".", ans": ".", "across_num": null, "down_num": null,
  #  "label": -1, "circled": false, "checked": 0}

  # also note - board is a tuple to facilitate easy access and due to
  # its fixed size

  @impl true
  def init(%{:name => board_name} = _args) do
    IO.puts "room " <> clean(board_name) <> " has been started"
    {:global, "board:" <> file_name} = board_name

    {:ok, body} = File.read(List.to_string(:code.priv_dir(:crossywordo))
                            <> "/boards/#{file_name}.json.puz")
    current = Poison.decode!(body) |>
              Map.put("room", file_name)
    {:ok, current}
  end

  @impl true
  def terminate(reason, board) do
    IO.puts reason

    file_name = Map.get(board, "room")
    IO.puts "file: " <> file_name

    File.write!(List.to_string(:code.priv_dir(:crossywordo))
                <> "/boards/#{file_name}.json.puz",
                Map.delete(board, "room") |>
                Poison.encode!())
    {:ok, reason}
  end

  @impl true
  def handle_call([call_type | rest], from, board) do
    case call_type do
      "get_clues" -> get_clues(rest, from, board)
      "get_dims" -> get_dims(rest, from, board)
      "get_states" -> get_states(rest, from, board)

      "set_letter" -> set_letter(rest, from, board)

      other -> failed_call([other | rest], from, board)
    end
  end

  def get_clues(_rest, {from_pid, _term}, board) do
    clues = [Map.get(board, "across_clues"), Map.get(board, "down_clues")]
    send(from_pid, "clues:" <> clean clues)
    {:reply, :ok, board}
  end

  def get_dims(_rest, {from_pid, _term}, board) do
    dims = [Map.get(board, "width"), Map.get(board, "height")]
    send(from_pid, "dims:" <> clean dims)
    {:reply, :ok, board}
  end

  def get_states(_rest, {from_pid, _term}, board) do
    tuple_board = Map.get(board, "board") |> List.to_tuple

    vals = 0..Map.get(board, "width")*Map.get(board, "height")-1 |>
           Enum.map(fn square_num ->
                      tuple_board |>
                      elem(square_num)
                    end)
    out = Poison.encode!(vals)
    send(from_pid, "states:" <> out)
    {:reply, :ok, board}
  end

  def set_letter([square_num, val, checked], {from_pid, term}, board) do
    if String.length(val) < 16 and
      not String.contains?(val, ["."]) and
      String.printable?(val) do

        new_board = Map.update!(board, "board",
                                  fn old_board ->
                                    old_board |>
                                    List.update_at(String.to_integer(square_num),
                                    fn square ->
                                      square |>
                                      Map.update!("c", fn _x -> val
                                                             end) |>
                                      Map.update!("h", fn _x -> checked
                                                             end)

                                    end)
                                  end)
        send(from_pid, "update:"<> Poison.encode! [square_num, val, checked])
        {:reply, :ok, new_board}
    else
      failed_call([square_num, val], {from_pid, term}, board)
    end
  end

  def failed_call(call_data, {from_pid, _term}, board) do
    send(from_pid, "fail:call to " <> clean(call_data) <> " failed")
    {:reply, :fail, board}
  end
end
