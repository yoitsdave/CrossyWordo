defmodule Crosswordo.Table do
  use Supervisor

  #TODO This will eventually supervise each Board

    def start_link(arg) do
      Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
    end

    def init(_arg) do
      children = [
        {Crossywordo.Board, [%{}]}
      ]

      Supervisor.init(children, strategy: :one_for_one)
    end

end
