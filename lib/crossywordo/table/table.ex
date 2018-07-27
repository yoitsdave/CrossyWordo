defmodule Crossywordo.Table do
  use Supervisor

  #TODO Create call to make new board

  def start_link(arg) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  def init(_arg) do
    Supervisor.init([], strategy: :one_for_one, restart: :temporary)
  end

  def start_board(args) do
    child = Supervisor.child_spec(Crossywordo.Board.child_spec(args),
                                  id: args.name)
    Supervisor.start_child(__MODULE__, child)
  end

  def get_board(args) do
    case start_board(args) do
      {:ok, pid} -> {:ok, pid}
      {:error, {:already_started, pid}} -> {:ok, pid}
    end
  end

end
