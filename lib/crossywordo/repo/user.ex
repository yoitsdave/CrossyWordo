defmodule Crossywordo.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do

    field :email, :string
    field :name, :string
    field :tier, :integer
    field :reset_to_free, :date
    field :oauth_token, :string

    has_many :_contacts, Crossywordo.Contact
    has_many :contacts, through: [:_contacts, :contact]

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :tier, :reset_to_free, :oauth_token, :contacts])
    |> validate_required([:name, :email, :tier])
  end
end
