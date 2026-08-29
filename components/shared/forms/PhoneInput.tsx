"use client"

import * as React from "react"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void
  }

function PhoneInput({
  ref,
  className,
  onChange,
  value,
  ...props
}: PhoneInputProps & {
  ref?: React.Ref<React.ComponentRef<typeof RPNInput.default>>
}) {
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      value={value || undefined}
      /**
       * Handles the onChange event.
       *
       * react-phone-number-input might trigger the onChange event as undefined
       * when a valid phone number is not entered. To prevent this,
       * the value is coerced to an empty string.
       *
       * @param {E164Number | undefined} value - The entered value
       */
      onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
      {...props}
    />
  )
}

function InputComponent({
  ref,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  ref?: React.Ref<HTMLInputElement>
}) {
  return (
    <Input
      className={cn("h-10 rounded-s-none rounded-e-lg", className)}
      {...props}
      ref={ref}
    />
  )
}

type CountryEntry = { label: string; value: RPNInput.Country | undefined }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const [searchValue, setSearchValue] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover
      isOpen={isOpen}
      isNonModal={false}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open) {
          setSearchValue("")
        }
      }}
    >
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-s-lg rounded-e-none border-r-0 border-border bg-muted px-3 focus:z-10"
          isDisabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <MaterialIcon
            name="unfold_more"
            className={cn(
              "-mr-2 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <div className="w-75 border-0 p-0 shadow-xs">
        <Command>
          <CommandInput
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value
              setSearchValue(value)
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    "[data-radix-scroll-area-viewport]"
                  )
                  if (viewportElement) {
                    viewportElement.scrollTop = 0
                  }
                }
              }, 0)
            }}
            placeholder="Buscar pais..."
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No hay resultados.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </div>
    </Popover>
  )
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country
  onChange: (country: RPNInput.Country) => void
  onSelectComplete: () => void
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country)
    onSelectComplete()
  }

  return (
    <CommandItem className="gap-2 text-muted-foreground" onClick={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm dark:text-black">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <MaterialIcon
        name="check_circle"
        className={`ml-auto ${country === selectedCountry ? "opacity-100" : "opacity-0"}`}
      />
    </CommandItem>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}

export { PhoneInput }
