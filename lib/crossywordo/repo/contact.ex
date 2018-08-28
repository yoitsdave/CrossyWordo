defmodule Crossywordo.Contact do
  use Ecto.Schema
  import Ecto.Changeset


  schema "contacts" do
    field :status, :integer

    belongs_to :user, Crossywordo.User
    belongs_to :contact, Crossywordo.User

    timestamps()
  end

  @doc false
  def changeset(contact, attrs) do
    contact
    |> cast(attrs, [:user, :contact, :status])
    |> validate_required([:user, :contact, :status])
  end
end
