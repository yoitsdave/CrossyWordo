defmodule Crossywordo.Board do
  use GenServer

  def start_link(%{:name => board_name} = args) do
    GenServer.start_link(__MODULE__, args, name: String.to_atom board_name)
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
    IO.puts "room " <> board_name <> " has been started"

    {:ok, body} = File.read("assets/vendor/example.json")
    current_board = Poison.decode!(body) |>
                    atomize_keys() |>
                    Map.update!(:board, fn state ->
                                         Enum.map(state, &atomize_keys(&1)) |>
                                         List.to_tuple
                                        end) |>
                    Map.put(:current, " ")
    {:ok, current_board}
  end

end
