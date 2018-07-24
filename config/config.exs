# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :crossywordo,
  ecto_repos: [Crossywordo.Repo]

# Configures the endpoint
config :crossywordo, CrossywordoWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "hvVpQ0c8COSxzihmdsYjBcFiGWorNs9IAPvM/GGHEXST0zg9UIVn4jtvl6PD2m5Z",
  render_errors: [view: CrossywordoWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Crossywordo.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
