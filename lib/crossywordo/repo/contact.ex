defmodule Crossywordo.Contact do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  schema "contacts" do

    field :status, :integer
    belongs_to :follower, Crossywordo.User, references: :uname, type: :string, primary_key: true
    belongs_to :following,Crossywordo.User, references: :uname, type: :string, primary_key: true

    timestamps()
  end

  @doc false
  def changeset(contact, attrs) do
    contact
    |> cast(attrs, [:follower, :following, :status])
    |> validate_required([:follower, :following, :status])
  end
end
