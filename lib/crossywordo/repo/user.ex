defmodule Crossywordo.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:uname, :string, []}
  @derive {Phoenix.Param, key: :uname}
  schema "users" do

    field :email, :string
    field :tier, :integer
    field :reset_to_free, :date
    field :oauth_token, :string

    has_many :_following, Crossywordo.Contact, foreign_key: :following_id
    has_many :following, through: [:_following, :following]

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :tier, :reset_to_free, :oauth_token, :following])
    |> validate_required([:email, :tier])
  end
end
