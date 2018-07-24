defmodule Crossywordo.Application do
  use Application

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      # Start the Ecto repository
      supervisor(Crossywordo.Repo, []),
      # Start the endpoint when the application starts
      supervisor(CrossywordoWeb.Endpoint, []),
      # Start the Table Supervisor
      supervisor(Crosswordo.Table, [%{}]),
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Crossywordo.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    CrossywordoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
