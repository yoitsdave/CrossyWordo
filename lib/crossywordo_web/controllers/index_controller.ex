defmodule CrossywordoWeb.IndexController do
  use CrossywordoWeb, :controller

  def index(conn,  _user_params) do
#    Crossywordo.Repo.insert(%Crossywordo.User{uname: "alice", email: "example@example.com", tier: 1})
#    Crossywordo.Repo.insert(%Crossywordo.User{uname: "bob", email: "example@example.com", tier: 1})

#    first = Crossywordo.Repo.get(Crossywordo.User, "alice") |> Crossywordo.Repo.preload(:following)
#    second = Crossywordo.Repo.get(Crossywordo.User, "bob") |> Crossywordo.Repo.preload(:following)

#    Crossywordo.Repo.insert(%Crossywordo.Contact{follower_id: "bob", following_id: "alice", status: 0})

#    first = Crossywordo.Repo.get(Crossywordo.User, "alice") |> Crossywordo.Repo.preload(:following)

    render conn, "index.html"
  end

end
