defmodule Crossywordo.Contact do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  schema "contacts" do
    field :status, :integer

    belongs_to :user, Crossywordo.User, primary_key: true
    belongs_to :contact, Crossywordo.User, primary_key: true

    timestamps()
  end

  @doc false
  def changeset(contact, attrs) do
    contact
    |> cast(attrs, [:user, :contact, :status])
    |> validate_required([:user, :contact, :status])
  end
end
