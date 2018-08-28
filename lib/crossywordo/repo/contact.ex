defmodule Crossywordo.Contact do
  use Ecto.Schema
  import Ecto.Changeset


  schema "contacts" do
    belongs_to :user, Crossywordo.User
    belongs_to :contact, Crossywordo.User

    timestamps()
  end

  @doc false
  def changeset(contact, attrs) do
    contact
    |> cast(attrs, [])
    |> validate_required([])
  end
end
