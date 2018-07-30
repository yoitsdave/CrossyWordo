defmodule Crossywordo.PuzTest do
  use Crossywordo.ModelCase

  alias Crossywordo.Puz

  @valid_attrs %{loc: "some loc"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Puz.changeset(%Puz{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Puz.changeset(%Puz{}, @invalid_attrs)
    refute changeset.valid?
  end
end
